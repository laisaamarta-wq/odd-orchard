import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FLAVORS, asset } from '../data/flavors.js'
import { useWorld, prefersReducedMotion, SIZES, FREE_DELIVERY, unitPrice, money } from '../state.jsx'
import { scrollToHash } from './Nav.jsx'

const isSheet = () => window.matchMedia('(max-width: 640px)').matches

/* Rolls a money value to its new number instead of jumping. */
function Money({ value, className }) {
  const el = useRef(null)
  const prev = useRef(value)
  useEffect(() => {
    const from = prev.current
    prev.current = value
    if (!el.current) return
    if (prefersReducedMotion() || from === value) {
      el.current.textContent = money(value)
      return
    }
    const o = { v: from }
    const t = gsap.to(o, {
      v: value,
      duration: 0.6,
      ease: 'power3.out',
      onUpdate: () => el.current && (el.current.textContent = money(o.v)),
    })
    gsap.fromTo(el.current, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' })
    return () => t.kill()
  }, [value])
  return (
    <span className={className} ref={el}>
      {money(value)}
    </span>
  )
}

function CartItem({ item, open, onRemoveAnimated }) {
  const { setQty } = useWorld()
  const f = FLAVORS.find((x) => x.id === item.flavorId)
  const size = SIZES.find((s) => s.id === item.size)
  const price = unitPrice(item.flavorId, item.size)
  const row = useRef(null)
  const num = useRef(null)
  const prevQty = useRef(item.qty)
  const mountedOpen = useRef(open)

  // Items added while the basket is open drop in.
  useLayoutEffect(() => {
    if (mountedOpen.current && !prefersReducedMotion())
      gsap.from(row.current, { y: -30, scale: 0.94, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.6)' })
  }, [])

  // Quantity digits slide in the direction of the change.
  useEffect(() => {
    const dir = item.qty > prevQty.current ? 1 : -1
    prevQty.current = item.qty
    if (prefersReducedMotion() || !num.current) return
    gsap.fromTo(num.current, { yPercent: 80 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' })
  }, [item.qty])

  const dec = () => (item.qty <= 1 ? onRemoveAnimated(item.key, row.current) : setQty(item.key, item.qty - 1))
  const inc = () => {
    setQty(item.key, item.qty + 1)
    if (!prefersReducedMotion())
      gsap.fromTo(row.current.querySelector('.cart-item__bottle'), { rotation: -12, y: -6 }, { rotation: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <li
      className={`cart-item cart-item--${f.id}`}
      ref={row}
      style={{ '--ibg': f.palette.bg, '--iink': f.palette.ink, '--ijuice': f.palette.juice, '--ideep': f.palette.deep, '--iaccent': f.palette.accent }}
    >
      <div className="cart-item__media" aria-hidden="true">
        <img className="cart-item__fruit" src={asset(`fruit-${f.id}-1`)} alt="" />
        <img className="cart-item__bottle" src={asset(`bottle-${f.id}`)} alt="" />
        {item.size === 'crate' && <span className="cart-item__badge">×6</span>}
      </div>
      <div className="cart-item__info">
        <p className="cart-item__name">{f.full}</p>
        <p className="cart-item__meta">
          {size.short} · {money(price)}
        </p>
        <div className="stepper" role="group" aria-label={`Quantity of ${f.full}, ${size.short}`}>
          <button onClick={dec} aria-label={item.qty <= 1 ? `Remove ${f.full}` : `Decrease quantity of ${f.full}`} data-cursor="Less">
            −
          </button>
          <span className="stepper__n" aria-live="polite">
            <span ref={num}>{item.qty}</span>
          </span>
          <button onClick={inc} aria-label={`Increase quantity of ${f.full}`} disabled={item.qty >= 99} data-cursor="More">
            +
          </button>
        </div>
      </div>
      <div className="cart-item__side">
        <button className="cart-item__remove" onClick={() => onRemoveAnimated(item.key, row.current)} aria-label={`Remove ${f.full} from basket`} data-cursor="Remove">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <Money value={price * item.qty} className="cart-item__sub" />
        <span className="cart-item__keeper">kept by {f.keeper.name}</span>
      </div>
    </li>
  )
}

export default function Cart() {
  const { cart, cartOpen: open, setCartOpen, totals, removeItem, clearCart, restoreCart, active } = useWorld()
  const root = useRef(null)
  const panel = useRef(null)
  const scrim = useRef(null)
  const closeBtn = useRef(null)
  const listRef = useRef(null)
  const [stage, setStage] = useState('basket') // basket | checkout
  const [undo, setUndo] = useState(null)
  const keeper = FLAVORS[active]
  const empty = cart.length === 0

  const close = useCallback(() => setCartOpen(false), [setCartOpen])

  /* ---------- open / close choreography ---------- */
  useEffect(() => {
    const sheet = isSheet()
    const off = sheet ? { yPercent: 105, xPercent: 0 } : { xPercent: 106, yPercent: 0 }
    const reduce = prefersReducedMotion()
    if (open) {
      window.__lenis?.stop()
      document.documentElement.classList.add('cart-lock')
      gsap.set(root.current, { autoAlpha: 1 })
      const tl = gsap.timeline()
      if (reduce) {
        gsap.set(scrim.current, { autoAlpha: 1 })
        gsap.set(panel.current, { xPercent: 0, yPercent: 0, y: 0 })
      } else {
        tl.fromTo(scrim.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
          .fromTo(panel.current, { ...off, y: 0 }, { xPercent: 0, yPercent: 0, duration: 0.85, ease: 'expo.out' }, 0)
          .fromTo(
            panel.current.querySelector('.cart__keeper img'),
            { yPercent: 70, rotation: 14 },
            { yPercent: 0, rotation: 0, duration: 0.9, ease: 'back.out(1.7)' },
            0.25,
          )
          .fromTo(
            panel.current.querySelectorAll('.cart__head > div, .cart-item, .cart__empty > *'),
            sheet ? { y: 40, autoAlpha: 0 } : { x: 60, autoAlpha: 0 },
            { x: 0, y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 },
            0.18,
          )
          .fromTo(panel.current.querySelectorAll('.cart__foot > *'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.05 }, 0.32)
      }
      const t = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 60)
      return () => {
        clearTimeout(t)
        tl.kill()
      }
    } else {
      window.__lenis?.start()
      document.documentElement.classList.remove('cart-lock')
      if (gsap.getProperty(root.current, 'autoAlpha') === 0) return
      const done = () => {
        gsap.set(root.current, { autoAlpha: 0 })
        setStage('basket')
      }
      if (reduce) return done()
      const tl = gsap
        .timeline({ onComplete: done })
        .to(panel.current, { ...off, duration: 0.55, ease: 'power3.in' }, 0)
        .to(scrim.current, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.1)
      document.querySelector('.basket')?.focus({ preventScroll: true })
      return () => tl.kill()
    }
  }, [open])

  /* ---------- keyboard: Esc + focus trap ---------- */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key !== 'Tab') return
      const f = [...panel.current.querySelectorAll('button:not([disabled]), a[href], input')].filter((el) => el.offsetParent !== null)
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  /* ---------- mobile: drag the sheet down to close ---------- */
  const drag = useRef(null)
  const onHandleDown = (e) => {
    if (!isSheet()) return
    drag.current = { y: e.clientY, t: performance.now() }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onHandleMove = (e) => {
    if (!drag.current) return
    const dy = Math.max(0, e.clientY - drag.current.y)
    gsap.set(panel.current, { y: dy })
    gsap.set(scrim.current, { autoAlpha: 1 - Math.min(0.7, dy / 600) })
  }
  const onHandleUp = (e) => {
    if (!drag.current) return
    const dy = e.clientY - drag.current.y
    const v = dy / Math.max(1, performance.now() - drag.current.t)
    drag.current = null
    if (dy > 120 || v > 0.6) {
      gsap.to(panel.current, { y: window.innerHeight, duration: 0.35, ease: 'power2.in', onComplete: () => gsap.set(panel.current, { y: 0 }) })
      close()
    } else {
      gsap.to(panel.current, { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' })
      gsap.to(scrim.current, { autoAlpha: 1, duration: 0.3 })
    }
  }

  /* ---------- removal with a little exit ---------- */
  const removeAnimated = (key, el) => {
    if (prefersReducedMotion() || !el) return removeItem(key)
    gsap
      .timeline({ onComplete: () => removeItem(key) })
      .to(el, { x: 70, rotation: 3, autoAlpha: 0, duration: 0.35, ease: 'power2.in' })
      .to(el, { height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.3, ease: 'power2.inOut' })
  }

  const clearAnimated = () => {
    const snapshot = cart
    const finish = () => {
      clearCart()
      setUndo(snapshot)
    }
    if (prefersReducedMotion()) return finish()
    gsap.to(listRef.current.querySelectorAll('.cart-item'), {
      x: 80,
      rotation: () => gsap.utils.random(-6, 6),
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.05,
      onComplete: finish,
    })
  }

  useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 6000)
    return () => clearTimeout(t)
  }, [undo])
  useEffect(() => {
    if (cart.length) setUndo(null)
  }, [cart.length])

  const browse = () => {
    close()
    setTimeout(() => scrollToHash('#product'), 350)
  }

  const toFree = Math.max(0, FREE_DELIVERY - totals.subtotal)
  const progress = Math.min(1, totals.subtotal / FREE_DELIVERY)

  return (
    <div className={`cart ${open ? 'is-open' : ''}`} ref={root} aria-hidden={!open}>
      <div className="cart__scrim" ref={scrim} onClick={close} />
      <aside className="cart__panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart__handle" onPointerDown={onHandleDown} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp}>
          <span />
        </div>

        <header className="cart__head">
          <div>
            <p className="label">
              {totals.count} {totals.count === 1 ? 'item' : 'items'} · {totals.bottles} {totals.bottles === 1 ? 'bottle' : 'bottles'}
            </p>
            <h2 id="cart-title" className="cart__title">
              The basket <em>kept by you.</em>
            </h2>
          </div>
          <button className="cart__close" ref={closeBtn} onClick={close} aria-label="Close basket" data-cursor="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div className="cart__keeper" aria-hidden="true">
            <img src={asset(`char-${keeper.id}`)} alt="" className={`cart__keeper--${keeper.id}`} />
          </div>
        </header>

        {stage === 'checkout' ? (
          <div className="cart__checkout">
            <img src={asset(`char-${keeper.id}`)} alt="" className={`cart__checkout-char cart__keeper--${keeper.id}`} />
            <p className="label">Checkout · next chapter</p>
            <h3 className="cart__checkout-title">
              {keeper.keeper.name} is <em>wrapping your bottles.</em>
            </h3>
            <p className="cart__checkout-text">
              This is a concept preview, so payment isn’t connected yet and nothing is charged. Your basket of {totals.bottles}{' '}
              {totals.bottles === 1 ? 'bottle' : 'bottles'} ({money(totals.total)}) is saved right here.
            </p>
            <button className="btn" onClick={() => setStage('basket')} data-cursor="Back">
              Back to the basket <span className="btn__arrow" aria-hidden="true">←</span>
            </button>
          </div>
        ) : (
          <>
            <div className="cart__body" data-lenis-prevent>
              {empty ? (
                <div className="cart__empty">
                  <p className="cart__empty-title">
                    Nothing in here <em>yet.</em>
                  </p>
                  <p className="cart__empty-text">
                    {keeper.keeper.name} is guarding an empty basket. {keeper.keeper.temperament}
                  </p>
                  {undo ? (
                    <button className="btn" onClick={() => restoreCart(undo)} data-cursor="Undo">
                      Undo — bring them back <span className="btn__arrow" aria-hidden="true">↺</span>
                    </button>
                  ) : (
                    <button className="btn" onClick={browse} data-cursor="Browse">
                      Choose a flavor <span className="btn__arrow" aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              ) : (
                <ul className="cart__list" ref={listRef}>
                  {cart.map((item) => (
                    <CartItem key={item.key} item={item} open={open} onRemoveAnimated={removeAnimated} />
                  ))}
                </ul>
              )}
            </div>

            {!empty && (
              <footer className="cart__foot">
                <div className="cart__free">
                  <p>
                    {toFree > 0 ? (
                      <>
                        Add <strong>{money(toFree)}</strong> more and the keepers deliver for free.
                      </>
                    ) : (
                      <>
                        <strong>Free delivery</strong> — the keepers will carry it themselves.
                      </>
                    )}
                  </p>
                  <span className="cart__free-bar">
                    <i style={{ transform: `scaleX(${progress})` }} />
                  </span>
                </div>
                <dl className="cart__sum">
                  <div>
                    <dt>Items</dt>
                    <dd>
                      {totals.count} <small>/ {totals.bottles} btl</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>
                      <Money value={totals.subtotal} />
                    </dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>{totals.delivery === 0 ? 'Free' : money(totals.delivery)}</dd>
                  </div>
                  <div className="cart__total">
                    <dt>Total</dt>
                    <dd>
                      <Money value={totals.total} />
                    </dd>
                  </div>
                </dl>
                <button className="btn btn--solid cart__checkout-btn" onClick={() => setStage('checkout')} data-cursor="Checkout">
                  Checkout <span className="btn__arrow" aria-hidden="true">→</span>
                </button>
                <button className="cart__clear" onClick={clearAnimated} data-cursor="Clear">
                  Clear basket
                </button>
              </footer>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
