# Odd Orchard — every flavor has a keeper

A conceptual, interactive juice-brand experience. Four flavors, four worlds, four keepers:
Moss (kiwi), Marmalade (orange), Vesper (cherry) and Pip (pitaya).

## Stack
- Vite + React 19
- GSAP (ScrollTrigger) for the world transitions, pinned scenes and micro-interactions
- Lenis smooth scroll
- Visual assets generated with Higgsfield (GPT Image 2.5), processed to transparent WebP

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build
```

No environment variables or secrets are required.

`scripts/process_assets.py` converts the raw Higgsfield PNGs (`raw/`, not committed) into the WebPs in `public/assets/`.

## Behance case study (`/behance/`)
A presentation-only case study page, built separately (`vite.behance.config.js`) so the production bundle is unchanged.
Every image on it is a real capture of the production site. See [`behance/PUBLISHING.md`](behance/PUBLISHING.md) for the copy, upload order and publishing settings.

```bash
npm run behance:dev       # http://localhost:5174/behance/
npm run behance:capture   # Playwright stills → public/behance/shots (needs the site at OO_BASE, default localhost:4173)
npm run behance:export    # plates + cover → behance-export/plates
npm run behance:motion    # deterministic 60 fps clips + GIFs → behance-export/motion (needs ffmpeg)
```
