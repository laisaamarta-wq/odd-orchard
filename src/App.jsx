import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Product from './components/Product.jsx'
import Story from './components/Story.jsx'
import Keepers from './components/Keepers.jsx'
import Ritual from './components/Ritual.jsx'
import Footer from './components/Footer.jsx'
import Cursor from './components/Cursor.jsx'
import Cart from './components/Cart.jsx'
import { prefersReducedMotion } from './state.jsx'
import { FLAVORS } from './data/flavors.js'

gsap.registerPlugin(ScrollTrigger)

// Seed the palette before first paint so nothing flashes.
const p = FLAVORS[0].palette
Object.entries(p).forEach(([k, v]) => document.documentElement.style.setProperty(`--${k}`, v))

export default function App() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 })
    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  // Fonts change line metrics; refresh pinned sections once they land.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <Product />
        <Story />
        <Keepers />
        <Ritual />
      </main>
      <Footer />
      <Cart />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
