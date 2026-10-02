import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FLAVORS, FRUIT_SLOTS, asset } from '../data/flavors.js'
import { useWorld, prefersReducedMotion, isTouch } from '../state.jsx'

const AUTOPLAY_MS = 7000

export default function Hero() {
  const { active, setActive, registerSwitcher } = useWorld()
  const root = useRef(null)
  const reveal = useRef(null)
  const anchor = useRef(null)
  const tilt = useRef(null)
  const ring = useRef(null)
  const wordRef = useRef(null)
  const charLayer = useRef(null)
  const glow = useRef(null)
  const bottles = useRef([])
  const chars = useRef([])
  const charImgs = useRef([])
  const threads = useRef([])
  const fruitSets = useRef([])
  const drops = useRef(null)
  const current = useRef(0)
  const busy = useRef(false)
  const queued = useRef(null) // latest world requested while a transition is still playing
  const switchRef = useRef(null)
  const idle = useRef([])
  const [autoplay, setAutoplay] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const introPlayed = useRef(false)

  /* ---------- character choreography ---------- */

  const vw = (n) => (window.innerWidth * n) / 100
  const vh = (n) => (window.innerHeight * n) / 100

  const killIdle = (i) => {
    ;(idle.current[i] || []).forEach((t) => t.kill())
    idle.current[i] = []
  }

  const startIdle = useCallback((i) => {
    killIdle(i)
    const w = chars.current[i]
    const img = charImgs.current[i]
    const m = FLAVORS[i].keeper.motion
    const t = []
    if (m === 'crawl') {
      t.push(gsap.to(img, { scaleY: 1.025, y: -3, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' }))
      t.push(gsap.to(img, { rotation: 2.5, duration: 4.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 }))
    } else if (m === 'flutter') {
      t.push(gsap.to(img, { scaleX: 0.82, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
      t.push(gsap.to(w, { y: -14, x: 6, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
    } else if (m === 'drop') {
      t.push(gsap.to(w, { rotation: 1.2, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
      t.push(gsap.to(img, { rotation: -4, duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 0%' }))
    } else if (m === 'swim') {
      t.push(gsap.to(w, { y: -18, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
      t.push(gsap.to(img, { rotation: -5, skewX: 3, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
    }
    idle.current[i] = t
  }, [])

  const enter = (i) => {
    const w = chars.current[i]
    const img = charImgs.current[i]
    const m = FLAVORS[i].keeper.motion
    const tl = gsap.timeline()
    gsap.set(w, { autoAlpha: 1, x: 0, y: 0, rotation: 0 })
    gsap.set(img, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0 })
    if (m === 'crawl') {
      // Moss crawls in from the left edge, step by step, and leans against the bottle.
      tl.from(w, { x: -vw(70), duration: 1.6, ease: 'power2.out' })
        .to(img, { rotation: -4, y: -8, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: 7, transformOrigin: '50% 100%' }, 0)
        .to(img, { rotation: 5, duration: 0.25, ease: 'power2.out' })
        .to(img, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    } else if (m === 'flutter') {
      // Marmalade arcs in from the top-right like a moth circling a lamp.
      gsap.set(w, { x: vw(65), y: -vh(55), rotation: -25 })
      tl.to(w, {
        keyframes: [
          { x: vw(18), y: vh(6), rotation: 10, duration: 0.7, ease: 'sine.inOut' },
          { x: -vw(6), y: -vh(16), rotation: -12, duration: 0.55, ease: 'sine.inOut' },
          { x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'power2.out' },
        ],
      }).to(img, { scaleX: 0.55, duration: 0.07, ease: 'none', yoyo: true, repeat: 23 }, 0)
    } else if (m === 'drop') {
      // Vesper lowers on a silk thread and swings to a stop.
      gsap.set(w, { transformOrigin: `50% ${-vh(100)}px` })
      tl.from(w, { y: -vh(110), duration: 1.0, ease: 'power3.out' })
        .from(threads.current[i], { scaleY: 0, duration: 1.0, ease: 'power3.out', transformOrigin: '50% 0%' }, 0)
        .to(w, { keyframes: [{ rotation: 4 }, { rotation: -3 }, { rotation: 1.6 }, { rotation: 0 }], duration: 1.4, ease: 'sine.inOut' }, 0.55)
    } else if (m === 'swim') {
      // Pip swims in on a slow wave, as if the air were water.
      tl.from(w, { x: vw(75), duration: 1.8, ease: 'power2.out' })
        .from(w, { y: vh(14), duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0)
        .to(img, { rotation: 7, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 5 }, 0)
    }
    return tl
  }

  const exit = (i) => {
    killIdle(i)
    const w = chars.current[i]
    const m = FLAVORS[i].keeper.motion
    const props =
      m === 'crawl'
        ? { x: -vw(70) }
        : m === 'flutter'
          ? { x: vw(60), y: -vh(60), rotation: 20 }
          : m === 'drop'
            ? { y: -vh(110) }
            : { x: -vw(85), y: -vh(10) }
    return gsap.to(w, { ...props, duration: 0.65, ease: 'power3.in', onComplete: () => gsap.set(w, { autoAlpha: 0 }) })
  }

  /* ---------- fruit burst + reaction ---------- */

  const burst = (i) => {
    const set = fruitSets.current[i]
    if (!set) return gsap.timeline()
    const heroBox = root.current.getBoundingClientRect()
    const a = anchor.current.getBoundingClientRect()
    const cx = a.left + a.width / 2 - heroBox.left
    const cy = a.top + a.height * 0.35 - heroBox.top
    const items = [...set.querySelectorAll('.fruit')]
    gsap.set(set, { autoAlpha: 1 })
    const tl = gsap.timeline()
    items.forEach((el, k) => {
      const [x, y, , , , rot] = FRUIT_SLOTS[k]
      const fx = (heroBox.width * x) / 100
      const fy = (heroBox.height * y) / 100
      tl.fromTo(
        el,
        { x: cx - fx, y: cy - fy, scale: 0.15, rotation: rot - 160, autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, rotation: rot, autoAlpha: 1, duration: 1.15, ease: 'expo.out' },
        k * 0.035,
      )
    })
    // juice drops
    const ds = drops.current ? [...drops.current.children] : []
    ds.forEach((d, k) => {
      const ang = (k / ds.length) * Math.PI * 2 + Math.random() * 0.4
      const dist = 90 + Math.random() * 160
      tl.fromTo(
        d,
        { x: 0, y: 0, scale: 0.4 + Math.random() * 0.8, autoAlpha: 1 },
        { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 40, autoAlpha: 0, duration: 0.9 + Math.random() * 0.4, ease: 'power3.out' },
        0,
      )
    })
    tl.fromTo(ring.current, { scale: 0.4, autoAlpha: 0.9 }, { scale: 2.6, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0)
    tl.fromTo(
      tilt.current,
      { scaleY: 0.93, scaleX: 1.05 },
      { scaleY: 1, scaleX: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' },
      0,
    )
    return tl
  }

  const hideFruits = (i) => {
    const set = fruitSets.current[i]
    if (!set) return gsap.timeline()
    const items = set.querySelectorAll('.fruit')
    return gsap.to(items, {
      scale: 0.3,
      autoAlpha: 0,
      y: () => gsap.utils.random(-120, 120),
      rotation: () => gsap.utils.random(-90, 90),
      duration: 0.5,
      ease: 'power2.in',
      stagger: 0.02,
      onComplete: () => gsap.set(set, { autoAlpha: 0 }),
    })
  }

  /* ---------- world switch ---------- */

  const copyEls = () => root.current.querySelectorAll('.js-copy')

  const switchTo = useCallback(
    (next, origin) => {
      const cur = current.current
      if (busy.current) {
        queued.current = { next, origin }
        return
      }
      if (next === cur) return
      busy.current = true
      current.current = next
      setProgressKey((k) => k + 1)
      const pal = FLAVORS[next].palette
      const vars = Object.fromEntries(Object.entries(pal).map(([k, v]) => [`--${k}`, v]))
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pal.bg)

      if (prefersReducedMotion()) {
        gsap.set(document.documentElement, vars)
        gsap.set([bottles.current[cur], chars.current[cur], fruitSets.current[cur]], { autoAlpha: 0 })
        gsap.set([bottles.current[next], chars.current[next], fruitSets.current[next]], { autoAlpha: 1, x: 0, y: 0 })
        gsap.set(fruitSets.current[next].querySelectorAll('.fruit'), { autoAlpha: 1, x: 0, y: 0, scale: 1 })
        setActive(next)
        busy.current = false
        return
      }

      // where the new world grows from
      const box = root.current.getBoundingClientRect()
      let ox = box.width / 2
      let oy = box.height / 2
      if (origin && origin.getBoundingClientRect) {
        const r = origin.getBoundingClientRect()
        ox = r.left + r.width / 2 - box.left
        oy = r.top + r.height / 2 - box.top
      }

      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false
          const q = queued.current
          queued.current = null
          if (q) switchRef.current?.(q.next, q.origin)
        },
      })
      tl.add(exit(cur), 0)
        .add(hideFruits(cur), 0)
        .to(bottles.current[cur], { y: 90, rotation: -9, scale: 0.92, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, 0.05)
        .to(copyEls(), { y: -18, autoAlpha: 0, duration: 0.35, ease: 'power2.in', stagger: 0.03 }, 0)
        .to(wordRef.current.querySelectorAll('.wl'), { yPercent: -115, rotation: -4, duration: 0.5, ease: 'power3.in', stagger: 0.03 }, 0)
        .set(reveal.current, { background: pal.bg, clipPath: `circle(0px at ${ox}px ${oy}px)`, autoAlpha: 1 }, 0.1)
        .to(reveal.current, { clipPath: `circle(${Math.hypot(box.width, box.height)}px at ${ox}px ${oy}px)`, duration: 1.0, ease: 'expo.inOut' }, 0.1)
        .to(document.documentElement, { ...vars, duration: 0.9, ease: 'power2.inOut' }, 0.2)
        .set(reveal.current, { autoAlpha: 0 }, 1.15)
        .call(() => setActive(next), null, 0.55)
        .fromTo(
          bottles.current[next],
          { y: 160, rotation: 10, scale: 0.9, autoAlpha: 0 },
          { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1.0, ease: 'back.out(1.5)' },
          0.62,
        )
        .fromTo(copyEls(), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 }, 0.85)
        .add(enter(next), 0.8)
        .add(burst(next), 0.8 + (next === 2 ? 1.0 : 1.35))
        .call(() => startIdle(next), null, 0.8 + 2.0)
    },
    [setActive, startIdle],
  )

  useEffect(() => {
    switchRef.current = switchTo
    registerSwitcher(switchTo)
  }, [registerSwitcher, switchTo])

  /* ---------- intro ---------- */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      FLAVORS.forEach((_, i) => {
        if (i !== 0) gsap.set([bottles.current[i], chars.current[i], fruitSets.current[i]], { autoAlpha: 0 })
      })
      gsap.set('.js-copy', { autoAlpha: 0, y: 24 })
      gsap.set(bottles.current[0], { autoAlpha: 0 })
      gsap.set(chars.current[0], { autoAlpha: 0 })
      gsap.set(fruitSets.current[0].querySelectorAll('.fruit'), { autoAlpha: 0 })
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    // wait for the hero assets (max 2.6s) then play the opening scene
    const imgs = [bottles.current[0], charImgs.current[0], ...fruitSets.current[0].querySelectorAll('img')]
    const ready = Promise.all(imgs.map((im) => (im.complete ? Promise.resolve() : im.decode().catch(() => {}))))
    const go = () => {
      if (introPlayed.current) return
      introPlayed.current = true
      setLoaded(true)
      if (prefersReducedMotion()) {
        gsap.set([bottles.current[0], chars.current[0], '.js-copy'], { autoAlpha: 1, y: 0 })
        gsap.set(fruitSets.current[0].querySelectorAll('.fruit'), { autoAlpha: 1 })
        return
      }
      const tl = gsap.timeline({ delay: 0.55 })
      tl.fromTo(bottles.current[0], { y: 220, rotation: 8, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.4)' })
        .to('.js-copy', { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 0.3)
        .add(enter(0), 0.5)
        .add(burst(0), 0.5 + 1.4)
        .call(() => startIdle(0), null, 2.6)
    }
    ready.then(go)
    const t = setTimeout(go, 2600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- word letters ---------- */

  useLayoutEffect(() => {
    if (!wordRef.current) return
    const letters = wordRef.current.querySelectorAll('.wl')
    const t = gsap.fromTo(
      letters,
      { yPercent: 115, rotation: 6 },
      { yPercent: 0, rotation: 0, duration: 1.1, ease: 'expo.out', stagger: 0.055, delay: loaded ? 0.05 : 0.7 },
    )
    return () => t.kill()
  }, [active, loaded])

  /* ---------- pointer: parallax, tilt, glow ---------- */

  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return
    const layers = [...root.current.querySelectorAll('[data-depth]')].map((el) => ({
      d: parseFloat(el.dataset.depth),
      x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
    }))
    const rx = gsap.quickTo(tilt.current, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(tilt.current, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const gx = gsap.quickTo(glow.current, 'x', { duration: 1.4, ease: 'power3.out' })
    const gy = gsap.quickTo(glow.current, 'y', { duration: 1.4, ease: 'power3.out' })
    const onMove = (e) => {
      const r = root.current.getBoundingClientRect()
      if (e.clientY > r.bottom) return
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      layers.forEach((l) => {
        l.x(-nx * 70 * l.d)
        l.y(-ny * 50 * l.d)
      })
      rx(nx * 26)
      ry(-ny * 14)
      gx(e.clientX - r.left)
      gy(e.clientY - r.top)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  /* ---------- autoplay (stops after the first manual choice) ---------- */

  useEffect(() => {
    if (!autoplay || !loaded || prefersReducedMotion()) return
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 })
    io.observe(root.current)
    const id = setInterval(() => {
      if (!visible || document.hidden) return
      switchTo((current.current + 1) % FLAVORS.length)
    }, AUTOPLAY_MS)
    return () => {
      clearInterval(id)
      io.disconnect()
    }
  }, [autoplay, loaded, switchTo])

  const choose = (i, el) => {
    setAutoplay(false)
    switchTo(i, el)
  }

  /* ---------- touch swipe on the stage ---------- */
  const swipe = useRef(null)
  const onPointerDown = (e) => (swipe.current = { x: e.clientX, y: e.clientY })
  const onPointerUp = (e) => {
    if (!swipe.current) return
    const dx = e.clientX - swipe.current.x
    const dy = e.clientY - swipe.current.y
    swipe.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const n = (current.current + (dx < 0 ? 1 : -1) + FLAVORS.length) % FLAVORS.length
      choose(n)
    }
  }

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = (current.current + (e.key === 'ArrowRight' ? 1 : -1) + FLAVORS.length) % FLAVORS.length
    const btn = root.current.querySelectorAll('.switch__btn')[n]
    btn?.focus()
    choose(n, btn)
  }

  const f = FLAVORS[active]

  return (
    <section className={`hero ${loaded ? 'is-loaded' : ''}`} ref={root} id="top" aria-label="Odd Orchard flavors">
      <div className="hero__reveal" ref={reveal} aria-hidden="true" />
      <div className="hero__glow" ref={glow} aria-hidden="true" />
      <div className="hero__rings" aria-hidden="true" data-depth="0.15">
        <span />
        <span />
        <span />
      </div>

      <div className="hero__word" aria-hidden="true" data-depth="0.25">
        <div className="hero__word-inner" ref={wordRef} key={f.id} style={{ '--len': f.word.length }}>
          {f.word.split('').map((ch, k) => (
            <span className="wm" key={k}>
              <span className="wl">{ch}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero__fruits" aria-hidden="true">
        {FLAVORS.map((fl, i) => (
          <div className="fruitset" key={fl.id} ref={(el) => (fruitSets.current[i] = el)}>
            {FRUIT_SLOTS.map(([x, y, size, piece, depth, , blur], k) => (
              <div
                className="fruit"
                key={k}
                style={{ left: `${x}%`, top: `${y}%`, width: `${size}vmin`, marginLeft: `${-size / 2}vmin`, marginTop: `${-size / 2}vmin`, '--blur': `${blur}px`, zIndex: Math.round(depth * 10) }}
              >
                <div className="fruit__p" data-depth={depth * 1.6}>
                  <img
                    src={asset(`fruit-${fl.id}-${piece}`)}
                    alt=""
                    draggable="false"
                    style={{ animationDelay: `${-k * 1.3}s`, animationDuration: `${6 + (k % 3) * 1.7}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hero__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className="anchor" ref={anchor}>
          <div className="anchor__shadow" />
          <div className="ring" ref={ring} />
          <div className="drops" ref={drops}>
            {Array.from({ length: 14 }).map((_, k) => (
              <i key={k} />
            ))}
          </div>
          <div className="tilt" ref={tilt}>
            {FLAVORS.map((fl, i) => (
              <img
                key={fl.id}
                ref={(el) => (bottles.current[i] = el)}
                className="bottle"
                src={asset(`bottle-${fl.id}`)}
                alt={i === active ? `Odd Orchard ${fl.full} cold-pressed juice bottle` : ''}
                draggable="false"
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
            ))}
            <div className="tilt__shine" />
          </div>
          <div className="chars" ref={charLayer} data-depth="0.45">
            {FLAVORS.map((fl, i) => (
              <div key={fl.id} className={`char char--${fl.id}`} ref={(el) => (chars.current[i] = el)}>
                {fl.keeper.motion === 'drop' && <span className="thread" ref={(el) => (threads.current[i] = el)} />}
                <img
                  ref={(el) => (charImgs.current[i] = el)}
                  src={asset(`char-${fl.id}`)}
                  alt={i === active ? `${fl.keeper.name}, the ${fl.keeper.species.toLowerCase()}` : ''}
                  draggable="false"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero__copy hero__copy--left">
        <p className="eyebrow js-copy">Cold-pressed · from an orchard that isn’t on any map</p>
        <h1 className="hero__title js-copy">
          Every flavor <em>has a keeper.</em>
        </h1>
        <div className="keeper-chip js-copy">
          <span className="keeper-chip__dot" />
          <span>
            {f.full} — kept by <strong>{f.keeper.name}</strong>, the {f.keeper.species.toLowerCase()}
          </span>
        </div>
        <a className="btn js-copy" href="#product" data-cursor="Taste">
          Taste the {f.name.toLowerCase()} world
          <span className="btn__arrow" aria-hidden="true">→</span>
        </a>
      </div>

      <div className="hero__copy hero__copy--right">
        <p className="counter js-copy">
          <span className="counter__now">Nº {f.no}</span>
          <span className="counter__total">/ 04</span>
        </p>
        <p className="hero__tag js-copy">{f.tagline}</p>
        <ul className="notes js-copy" aria-label="Tasting notes">
          {f.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      <p className="hero__below js-copy">
        <span className="keeper-chip__dot" />
        kept by <strong>{f.keeper.name}</strong> · {f.keeper.species.toLowerCase()}
      </p>

      <div className="switch" role="tablist" aria-label="Choose a flavor world" onKeyDown={onKeyDown}>
        {FLAVORS.map((fl, i) => (
          <button
            key={fl.id}
            role="tab"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={`switch__btn ${i === active ? 'is-active' : ''}`}
            style={{ '--c': fl.palette.bg, '--j': fl.palette.juice }}
            onClick={(e) => choose(i, e.currentTarget)}
            data-cursor="Switch"
          >
            <span className="switch__thumb">
              <img src={asset(`bottle-${fl.id}`)} alt="" />
            </span>
            <span className="switch__label">
              <span className="switch__no">{fl.no}</span>
              <span className="switch__name">{fl.name}</span>
            </span>
            {i === active && autoplay && loaded && <span className="switch__progress" key={progressKey} />}
          </button>
        ))}
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>scroll into the orchard</span>
        <i />
      </div>

      <div className={`loader ${loaded ? 'is-done' : ''}`} aria-hidden="true">
        <div className="loader__eye">
          <span />
        </div>
        <p>opening the orchard gate…</p>
      </div>
    </section>
  )
}
