import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { FLAVORS } from './data/flavors.js'

const Ctx = createContext(null)

export const SIZES = [
  { id: '250', label: '250 ml', short: '250 ml', mult: 1, bottles: 1 },
  { id: '500', label: '500 ml', short: '500 ml', mult: 1.7, bottles: 1 },
  { id: 'crate', label: 'Crate · 6', short: 'Crate of 6 × 250 ml', mult: 5.4, bottles: 6 },
]
export const FREE_DELIVERY = 20
export const DELIVERY_FEE = 3.9

export const unitPrice = (flavorId, sizeId) => {
  const f = FLAVORS.find((x) => x.id === flavorId)
  const s = SIZES.find((x) => x.id === sizeId)
  return Math.round(f.price * s.mult * 100) / 100
}
export const money = (n) => `€${n.toFixed(2)}`

const STORE_KEY = 'odd-orchard-basket-v1'
const loadCart = () => {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((i) => FLAVORS.some((f) => f.id === i.flavorId) && SIZES.some((s) => s.id === i.size) && i.qty > 0)
      : []
  } catch {
    return []
  }
}

export function WorldProvider({ children }) {
  const [active, setActive] = useState(0)
  const [cart, setCart] = useState(loadCart)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(cart))
    } catch {
      /* storage unavailable — the basket still works for this visit */
    }
  }, [cart])

  // The hero registers the cinematic transition here; anything on the page can request a world change.
  const switcher = useRef(null)
  const requestSwitch = useCallback((index, origin) => {
    if (switcher.current) switcher.current(index, origin)
    else setActive(index)
  }, [])
  const registerSwitcher = useCallback((fn) => {
    switcher.current = fn
  }, [])

  const addItem = useCallback((flavorId, size, qty = 1) => {
    setCart((c) => {
      const key = `${flavorId}-${size}`
      const found = c.find((i) => i.key === key)
      if (found) return c.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
      return [...c, { key, flavorId, size, qty }]
    })
  }, [])
  const setQty = useCallback((key, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((i) => i.key !== key) : c.map((i) => (i.key === key ? { ...i, qty: Math.min(99, qty) } : i))))
  }, [])
  const removeItem = useCallback((key) => setCart((c) => c.filter((i) => i.key !== key)), [])
  const clearCart = useCallback(() => setCart([]), [])
  const restoreCart = useCallback((items) => setCart(items), [])

  const totals = useMemo(() => {
    const count = cart.reduce((n, i) => n + i.qty, 0)
    const bottles = cart.reduce((n, i) => n + i.qty * SIZES.find((s) => s.id === i.size).bottles, 0)
    const subtotal = cart.reduce((n, i) => n + i.qty * unitPrice(i.flavorId, i.size), 0)
    const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY ? 0 : DELIVERY_FEE
    return { count, bottles, subtotal, delivery, total: subtotal + delivery }
  }, [cart])

  return (
    <Ctx.Provider
      value={{
        active,
        setActive,
        requestSwitch,
        registerSwitcher,
        cart,
        addItem,
        setQty,
        removeItem,
        clearCart,
        restoreCart,
        totals,
        basket: totals.count,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useWorld = () => useContext(Ctx)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
