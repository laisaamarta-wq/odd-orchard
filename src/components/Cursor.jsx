import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { isTouch, prefersReducedMotion } from '../state.jsx'

// A juicy blob cursor that names what you're about to do.
export default function Cursor() {
  const dot = useRef(null)
  const [label, setLabel] = useState('')
  const [enabled] = useState(() => !isTouch() && !prefersReducedMotion())

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const x = gsap.quickTo(dot.current, 'x', { duration: 0.35, ease: 'power3.out' })
    const y = gsap.quickTo(dot.current, 'y', { duration: 0.35, ease: 'power3.out' })
    const move = (e) => {
      x(e.clientX)
      y(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button, input')
      const l = t ? t.getAttribute('data-cursor') || (t.tagName === 'INPUT' ? '' : '·') : ''
      setLabel((prev) => (prev === l ? prev : l))
    }
    const down = () => gsap.to(dot.current, { scale: 0.8, duration: 0.15 })
    const up = () => gsap.to(dot.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
    const out = () => gsap.to(dot.current, { autoAlpha: 0, duration: 0.2 })
    const over = () => gsap.to(dot.current, { autoAlpha: 1, duration: 0.2 })
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', out)
    document.addEventListener('pointerenter', over)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', out)
      document.removeEventListener('pointerenter', over)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className={`cursor ${label ? 'is-hover' : ''} ${label && label !== '·' ? 'has-label' : ''}`} ref={dot} aria-hidden="true">
      <span>{label !== '·' ? label : ''}</span>
    </div>
  )
}
