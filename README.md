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
