import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useWorld } from '../state.jsx'

const LINKS = [
  ['Flavors', '#top'],
  ['The bottle', '#product'],
  ['Field notes', '#story'],
  ['Keepers', '#keepers'],
  ['Ritual', '#ritual'],
]

export const scrollToHash = (hash) => {
  const el = document.querySelector(hash)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 40 24" aria-hidden="true">
        <path d="M2 12C8 4 14 1 20 1s12 3 18 11c-6 8-12 11-18 11S8 20 2 12Z" fill="currentColor" />
        <circle cx="20" cy="12" r="5.5" fill="var(--bg)" />
        <circle cx="20" cy="12" r="2.4" fill="currentColor" />
      </svg>
      <span className="logo__word">
        Odd<span>Orchard</span>
      </span>
    </span>
  )
}

export default function Nav() {
  const { basket, setCartOpen, cartOpen } = useWorld()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const count = useRef(null)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > last && y > 240)
      setSolid(y > 40)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!basket || !count.current) return
    setHidden(false) // reveal the basket whenever something lands in it
    gsap.fromTo(count.current, { scale: 1.8, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  }, [basket])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (e, hash) => {
    e.preventDefault()
    setOpen(false)
    scrollToHash(hash)
  }

  return (
    <>
      <header className={`nav ${hidden && !open && !cartOpen ? 'is-hidden' : ''} ${solid ? 'is-solid' : ''}`}>
        <a href="#top" className="nav__logo" onClick={(e) => go(e, '#top')} aria-label="Odd Orchard, back to top">
          <Logo />
        </a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} onClick={(e) => go(e, h)}>
              <span data-text={l}>{l}</span>
            </a>
          ))}
        </nav>
        <div className="nav__right">
          <button
            className="basket"
            aria-label={`Open basket, ${basket} items`}
            aria-haspopup="dialog"
            aria-expanded={cartOpen}
            data-cursor="Open"
            onClick={() => {
              setOpen(false)
              setCartOpen(true)
            }}
          >
            Basket <span className="basket__count" ref={count}>{basket}</span>
          </button>
          <button
            className={`burger ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {LINKS.map(([l, h], i) => (
            <a key={h} href={h} onClick={(e) => go(e, h)} tabIndex={open ? 0 : -1} style={{ '--i': i }}>
              <small>0{i + 1}</small>
              {l}
            </a>
          ))}
        </nav>
        <p className="menu__foot">Every flavor has a keeper.</p>
      </div>
    </>
  )
}
