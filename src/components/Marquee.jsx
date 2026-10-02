import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FLAVORS } from '../data/flavors.js'
import { prefersReducedMotion } from '../state.jsx'

const ITEMS = [...FLAVORS.map((f) => f.word), 'Cold-pressed', 'No added sugar', 'Kept by creatures', 'Bottled within 6 hours']

function Row() {
  return (
    <div className="marquee__row">
      {ITEMS.map((t, i) => (
        <span key={i} className="marquee__item">
          {t}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  const track = useRef(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const tween = gsap.to(track.current, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 })
    // Scroll velocity speeds it up and flips direction with the scroll.
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const dir = self.direction < 0 ? -1 : 1
        let ts = gsap.utils.clamp(-5, 5, self.getVelocity() / 250)
        if (Math.abs(ts) < 1) ts = dir
        gsap.to(tween, { timeScale: ts, duration: 0.3, overwrite: true })
        gsap.to(tween, { timeScale: dir, duration: 1.4, delay: 0.35 })
      },
    })
    return () => {
      tween.kill()
      st.kill()
    }
  }, [])
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track" ref={track}>
        <Row />
        <Row />
      </div>
    </div>
  )
}
