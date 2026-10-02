import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './case.css'
import Case from './Case.jsx'

// Plates are 1400px artboards; on narrower screens the whole artboard scales down.
const fit = () => document.documentElement.style.setProperty('--s', String(Math.min(1, window.innerWidth / 1400)))
fit()
window.addEventListener('resize', fit)

const q = new URLSearchParams(window.location.search)
if (q.has('export')) document.documentElement.classList.add('is-export')

createRoot(document.getElementById('case')).render(
  <StrictMode>
    <Case only={q.get('plate')} />
  </StrictMode>,
)
