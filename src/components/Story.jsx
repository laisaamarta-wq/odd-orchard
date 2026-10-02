import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { FLAVORS, asset } from '../data/flavors.js'
import { prefersReducedMotion } from '../state.jsx'

const CHAPTERS = [
  {
    f: 0,
    roman: 'I',
    num: '01',
    title: 'The orchard moves at night.',
    text: 'Nobody planted it. It appeared one spring between a motorway and a forgotten birch forest, and by autumn it had wandered three kilometres north. Its fruit ripens only while someone is watching.',
  },
  {
    f: 1,
    roman: 'II',
    num: '02',
    title: 'So the creatures watch.',
    text: 'Each tree chose a keeper — something that looked a little like its fruit and a lot like its mood. The orange grove picked Marmalade, who cannot sit still and circles anything that glows.',
  },
  {
    f: 2,
    roman: 'III',
    num: '03',
    title: 'Cherries ripen in the dark.',
    text: 'So their keeper sleeps upside down all day and works the night shift. Nobody has ever seen Vesper blink. Nobody has ever seen Vesper not smirk.',
  },
  {
    f: 3,
    roman: 'IV',
    num: '04',
    title: 'Pip never noticed the river left.',
    text: 'The pitaya tree grew where the water used to be. Pip just kept swimming — slow loops through the air, blowing seed-bubbles at passing bees.',
  },
]

export default function Story() {
  const root = useRef(null)
  const track = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const distance = () => track.current.scrollWidth - window.innerWidth
      const horizontal = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      // characters and fruit drift through their panels
      root.current.querySelectorAll('.chapter').forEach((panel) => {
        const c = panel.querySelector('.chapter__char')
        const fr = panel.querySelectorAll('.chapter__fruit')
        const big = panel.querySelector('.chapter__roman')
        const st = { trigger: panel, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true }
        if (c) gsap.fromTo(c, { xPercent: 40, rotation: 8 }, { xPercent: -30, rotation: -6, ease: 'none', scrollTrigger: st })
        fr.forEach((el, k) =>
          gsap.fromTo(el, { xPercent: 120 + k * 80, rotation: -40 }, { xPercent: -120 - k * 60, rotation: 60, ease: 'none', scrollTrigger: st }),
        )
        if (big) gsap.fromTo(big, { xPercent: 30 }, { xPercent: -30, ease: 'none', scrollTrigger: st })
        const words = panel.querySelectorAll('.chapter__title .w')
        gsap.from(words, {
          yPercent: 110,
          stagger: 0.04,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'left 70%', toggleActions: 'play none none reverse' },
        })
      })
      // progress line
      gsap.fromTo(
        root.current.querySelector('.story__progress i'),
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } },
      )
    })
    mm.add('(max-width: 767px)', () => {
      root.current.querySelectorAll('.chapter').forEach((panel) => {
        const c = panel.querySelector('.chapter__char')
        if (c)
          gsap.fromTo(c, { y: 60, rotation: 6 }, { y: -40, rotation: -4, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.from(panel.querySelectorAll('.chapter__title .w'), {
          yPercent: 110,
          stagger: 0.04,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: panel, start: 'top 75%' },
        })
      })
    })
    return () => mm.revert()
  }, [])

  const split = (t) =>
    t.split(' ').map((w, i) => (
      <Fragment key={i}>
        <span className="wm">
          <span className="w">{w}</span>
        </span>{' '}
      </Fragment>
    ))

  return (
    <section className="story" id="story" ref={root} aria-labelledby="story-title">
      <div className="story__progress" aria-hidden="true">
        <i />
      </div>
      <div className="story__track" ref={track}>
        <article className="story__intro">
          <p className="label">Field notes · 1 of 1</p>
          <h2 id="story-title" className="story__heading">
            An orchard that <em>isn’t on any map.</em>
          </h2>
          <p className="story__lede">
            We didn’t invent the creatures. We just noticed them first — and asked, very politely, if we could press what they were guarding.
          </p>
          <p className="story__cue" aria-hidden="true">
            keep scrolling <span>→</span>
          </p>
        </article>

        {CHAPTERS.map((ch) => {
          const fl = FLAVORS[ch.f]
          return (
            <article
              className={`chapter chapter--${fl.id}`}
              key={fl.id}
              style={{ '--pbg': fl.palette.bg, '--pink': fl.palette.ink, '--pdeep': fl.palette.deep, '--paccent': fl.palette.accent }}
            >
              <span className="chapter__roman" aria-hidden="true">
                {ch.num}
              </span>
              <div className="chapter__media" aria-hidden="true">
                <img className="chapter__fruit" src={asset(`fruit-${fl.id}-1`)} alt="" loading="lazy" />
                <img className="chapter__fruit chapter__fruit--2" src={asset(`fruit-${fl.id}-3`)} alt="" loading="lazy" />
                <img className="chapter__char" src={asset(`char-${fl.id}`)} alt="" loading="lazy" />
              </div>
              <div className="chapter__copy">
                <p className="label">
                  Chapter {ch.roman} · {fl.keeper.name}
                </p>
                <h3 className="chapter__title">{split(ch.title)}</h3>
                <p className="chapter__text">{ch.text}</p>
              </div>
            </article>
          )
        })}

        <article className="story__outro">
          <p className="story__quote">
            “We only press what the keepers hand us. That’s why every bottle tastes like <em>someone was looking after it.</em>”
          </p>
          <p className="label">— The pressers, somewhere off the map</p>
        </article>
      </div>
    </section>
  )
}
