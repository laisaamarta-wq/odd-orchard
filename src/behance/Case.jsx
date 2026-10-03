// ODD ORCHARD — Behance case study.
// Presentation-only: every image is a real capture of the production site
// (scripts/behance/capture.mjs) or a real asset from /public/assets, and every
// colour, name and line of product copy comes from src/data/flavors.js.
import { FLAVORS, asset } from '../data/flavors.js'

// The site's logo mark (same SVG as components/Nav.jsx), inlined so the case
// never pulls production components into its bundle.
function Logo() {
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

const shot = (n) => `/behance/shots/${n}.webp`
const [KIWI, ORANGE, CHERRY, PITAYA] = FLAVORS
const LIVE = 'odd-orchard.vercel.app'
const TOKENS = ['bg', 'bg2', 'ink', 'accent', 'deep', 'juice', 'ondeep']
const PAPER = { bg: '#F4F0E6', ink: '#17150F' }

// Keeper placement relative to the bottle — the same rules the hero uses (.char--*)
const CHAR = {
  kiwi: { width: '150%', right: '64%', bottom: '-4%' },
  orange: { width: '160%', left: '40%', top: '-24%' },
  cherry: { width: '74%', left: '86%', top: '-6%' },
  pitaya: { width: '160%', right: '50%', top: '44%' },
}
const MOTION = {
  crawl: 'Crawls in from the left edge, step by step, and leans against the bottle.',
  flutter: 'Arcs in from the top-right like a moth circling a lamp.',
  drop: 'Lowers on a silk thread and swings to a stop.',
  swim: 'Swims in on a slow wave, as if the air were water.',
}

// readable label colour on a swatch
const onColor = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return l > 0.6 ? '#17150F' : '#FFFFFF'
}
const pal = (f) => Object.fromEntries(Object.entries(f.palette).map(([k, v]) => [`--${k}`, v]))

/* ---------- building blocks ---------- */

function Plate({ id, h, theme = PAPER, label, full, className = '', children }) {
  return (
    <section className={`plate ${className}`} id={`plate-${id}`} data-plate={id} style={{ '--h': h, '--pbg': theme.bg, '--pink': theme.ink }}>
      <div className="plate__art">
        {!full && (
          <header className="plate__head">
            <span>Odd Orchard — a field guide</span>
            <span>{label}</span>
            <span>
              Plate {plateNo(id)} / {TOTAL}
            </span>
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

// A bottle with its keeper, composed exactly like the hero anchor.
function Specimen({ f, h, shadow = true, className = '', style }) {
  return (
    <div className={`sp sp--${f.id} ${className}`} style={{ height: h, width: h * 0.46, ...style }}>
      {shadow && <div className="sp__shadow" />}
      <img className="sp__bottle" src={asset(`bottle-${f.id}`)} alt={`${f.full} bottle`} />
      <div className="sp__char" style={CHAR[f.id]}>
        {f.keeper.motion === 'drop' && <span className="sp__thread" />}
        <img src={asset(`char-${f.id}`)} alt={`${f.keeper.name}, the ${f.keeper.species.toLowerCase()}`} />
      </div>
    </div>
  )
}

const Title = ({ a, b, size = 112, className = '' }) => (
  <h2 className={`t-display ${className}`} style={{ fontSize: size }}>
    {a} <em>{b}</em>
  </h2>
)

const Shot = ({ n, w, h, alt, className = '', radius = 16, pos }) => (
  <img className={`shot ${className}`} src={shot(n)} alt={alt} style={{ width: w, height: h, borderRadius: radius, objectPosition: pos }} loading="lazy" />
)

const Cap = ({ k, children }) => (
  <p className="cap">
    {k && <b>{k}</b>}
    {children}
  </p>
)

/* ---------- 01 · four worlds ---------- */

function P01() {
  const W = 350
  const over = (
    <div className="p01__over">
      <div className="p01__logo">
        <Logo />
      </div>
      <p className="p01__tag mono">Cold-pressed · four flavors · four keepers</p>
      <h1 className="t-display p01__title">
        Every flavor <em>has a keeper.</em>
      </h1>
    </div>
  )
  return (
    <Plate id="01" h={1000} full className="p01">
      {FLAVORS.map((f, i) => (
        <div key={f.id} className={`p01__col p01__col--${f.id}`} style={{ ...pal(f), left: i * W, width: W }}>
          <span className="p01__wordclip" aria-hidden="true">
            <span className="p01__word">{f.word}</span>
          </span>
          <Specimen f={f} h={430} />
          <div className="p01__foot">
            <span className="mono">Nº {f.no}</span>
            <strong>{f.full}</strong>
            <em>kept by {f.keeper.name}</em>
          </div>
        </div>
      ))}
      {/* the same headline four times, each clipped to its world and inked in its colour */}
      {FLAVORS.map((f, i) => (
        <div key={f.id} className="p01__clip" style={{ ...pal(f), clipPath: `inset(0 ${1400 - (i + 1) * W}px 0 ${i * W}px)` }} aria-hidden={i > 0}>
          {over}
        </div>
      ))}
    </Plate>
  )
}

/* ---------- 03 · a flavor is a world ---------- */

function P03() {
  const f = KIWI
  return (
    <Plate id="03" h={0} label="01 — Brand identity · Idea">
      {/* The problem, as a one-line lead-in that the plate immediately answers. */}
      <h2 className="t-display p03__kicker">
        Most juice brands <em>look alike.</em>
      </h2>
      <div className="grid p03__top">
        <Title a="A flavor is" b="a world." size={120} />
        <p className="lede">
          Every flavor is defined once, as data: seven colour tokens, a keeper, four fruit pieces, copy and a motion verb. The interface reads that
          record and rebuilds itself around it.
        </p>
      </div>

      <div className="p03__sheet">
        <div className="p03__fig" style={pal(f)}>
          <span className="mono p03__fig-no">Fig. 1 — Nº {f.no} {f.full}</span>
          <Specimen f={f} h={440} style={{ marginLeft: 80 }} />
        </div>
        <ol className="p03__layers">
          <li>
            <span className="mono">01 · Palette</span>
            <div className="sw-row">
              {TOKENS.map((t) => (
                <span key={t} className="sw">
                  <i style={{ background: f.palette[t] }} />
                  <small className="mono">{t}</small>
                </span>
              ))}
            </div>
          </li>
          <li>
            <span className="mono">02 · Keeper</span>
            <p>
              <strong>{f.keeper.name}</strong>, {f.keeper.species.toLowerCase()} · <em>{f.keeper.latin}</em>
            </p>
          </li>
          <li>
            <span className="mono">03 · Fruit</span>
            <div className="p03__fruit">
              {[1, 2, 3, 4].map((n) => (
                <img key={n} src={asset(`fruit-${f.id}-${n}`)} alt="" />
              ))}
            </div>
          </li>
          <li>
            <span className="mono">04 · Copy</span>
            <p>
              <em className="big">{f.tagline}</em>
            </p>
            <div className="pills">
              {f.notes.map((n) => (
                <span key={n} className="mono">
                  {n}
                </span>
              ))}
            </div>
          </li>
          <li>
            <span className="mono">05 · Motion</span>
            <p>
              <strong>{f.keeper.motion}</strong> — {MOTION[f.keeper.motion]}
            </p>
          </li>
        </ol>
      </div>

    </Plate>
  )
}

/* ---------- 04 · visual language ---------- */

function P04() {
  const theme = { bg: KIWI.palette.ink, ink: KIWI.palette.bg }
  return (
    <Plate id="04" h={0} theme={theme} label="01 — Brand identity · Visual language" className="p04">
      <div className="grid p04__top">
        <Title a="Grotesque says what it is." b="Serif says how it feels." size={92} />
        <p className="lede">
          Mono labels turn every screen into a specimen sheet. The palette is not a set of brand colours: it is four complete worlds of seven tokens,
          tweened live on the root element when the flavor changes.
        </p>
      </div>

      <div className="p04__type">
        <div>
          <span className="p04__aa t-cond">Aa</span>
          <p className="mono">Bricolage Grotesque</p>
          <p>Display · 800 · width 75 · −0.035em</p>
        </div>
        <div>
          <span className="p04__aa t-serif">Aa</span>
          <p className="mono">Instrument Serif Italic</p>
          <p>The second voice inside a headline</p>
        </div>
        <div>
          <span className="p04__aa t-mono">Aa</span>
          <p className="mono">JetBrains Mono</p>
          <p>Labels · 11px · uppercase · +0.14em</p>
        </div>
      </div>

      <div className="p04__colors">
        {FLAVORS.map((f) => (
          <div key={f.id} className="p04__row">
            <div className="p04__rowlab">
              <span className="mono">Nº {f.no}</span>
              <strong>{f.name}</strong>
            </div>
            {TOKENS.map((t) => (
              <div key={t} className="chip" style={{ background: f.palette[t], color: onColor(f.palette[t]) }}>
                <span className="mono">--{t}</span>
                <span className="mono">{f.palette[t].toUpperCase()}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="p04__specs mono">
        <span>Radius 28px</span>
        <span>Pills 999px</span>
        <span>Gutter clamp(16px, 3.4vw, 52px)</span>
        <span>Grain 7.5%</span>
        <span>Ease cubic-bezier(.16, 1, .3, 1)</span>
      </div>
    </Plate>
  )
}

/* ---------- 05 · the keepers ---------- */

function P05() {
  return (
    <Plate id="05" h={1800} full className="p05">
      {FLAVORS.map((f) => (
        <article key={f.id} className={`p05__cell p05__cell--${f.id}`} style={pal(f)}>
          <header className="mono">
            <span>{f.no === '01' ? '01 — Brand identity · Keepers' : f.keeper.species}</span>
            <span>Nº {f.no} / 04</span>
          </header>
          <img className="p05__char" src={asset(`char-${f.id}`)} alt={`${f.keeper.name}, the ${f.keeper.species.toLowerCase()}`} />
          <div className="p05__body">
            <h3 className="t-cond">{f.keeper.name}</h3>
            <p className="p05__species">
              {f.keeper.species} · <em>{f.keeper.latin}</em>
            </p>
            <dl>
              <div>
                <dt className="mono">Temperament</dt>
                <dd>{f.keeper.temperament}</dd>
              </div>
              <div>
                <dt className="mono">Favourite hour</dt>
                <dd>{f.keeper.hour}</dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </Plate>
  )
}

/* ---------- 06 · hero × 4 ---------- */

function P06() {
  return (
    <Plate id="06" h={0} label="02 — Digital experience · Hero">
      <div className="grid p06__top">
        <Title a="One layout," b="four worlds." size={112} />
        <p className="lede">Nothing in the hero is written for one flavor. Palette, word, keeper, fruit, tagline and notes all come from the active world.</p>
      </div>
      <Shot n="shot-hero-kiwi" w={1240} h={775} alt="Hero, kiwi world" />
      <div className="row3">
        {[ORANGE, CHERRY, PITAYA].map((f) => (
          <figure key={f.id}>
            <Shot n={`shot-hero-${f.id}`} w={397} h={248} alt={`Hero, ${f.name.toLowerCase()} world`} radius={10} />
            <Cap k={`Nº ${f.no}`}>
              {f.full} — {f.keeper.name}, {f.keeper.species.toLowerCase()}
            </Cap>
          </figure>
        ))}
      </div>
    </Plate>
  )
}

/* ---------- 07 · the switch ---------- */

const FRAMES = [
  ['0380', '0.38 s', 'Moss leaves, the bottle drops, the word falls out of frame.'],
  ['0520', '0.52 s', 'The cherry world grows out of the button that was pressed.'],
  ['0700', '0.70 s', 'The palette tweens across the whole page, not just the hero.'],
  ['0950', '0.95 s', 'The new bottle rises with a little overshoot.'],
  ['1700', '1.70 s', 'Vesper lowers on a silk thread and swings to a stop.'],
  ['3600', '3.60 s', 'Fruit bursts out from the bottle; the keeper settles into its idle loop.'],
]

function P07() {
  const theme = { bg: CHERRY.palette.bg, ink: CHERRY.palette.ink }
  return (
    <Plate id="07" h={0} theme={theme} label="02 — Digital experience · World switch" className="p07">
      <div className="grid p07__top">
        <Title a="The switch is staged," b="not faded." size={104} />
        <p className="lede">
          One click runs a single timeline: the old keeper exits, the new world opens from the tapped button, the palette tweens on the root, the bottle
          drops in, and the new keeper arrives in character.
        </p>
      </div>
      <div className="p07__frames">
        {FRAMES.map(([n, t, c], k) => (
          <figure key={n}>
            <Shot n={`seq-switch-${n}`} w={397} h={248} alt={`World switch at ${t}`} radius={10} />
            <Cap k={`${String(k + 1).padStart(2, '0')} · ${t}`}>{c}</Cap>
          </figure>
        ))}
      </div>
      <div className="p07__motions">
        {FLAVORS.map((f) => (
          <div key={f.id} style={pal(f)}>
            <span className="p07__mchar">
              <img src={asset(`char-${f.id}`)} alt="" />
            </span>
            <p>
              <strong>{f.keeper.name}</strong> <span className="mono">{f.keeper.motion}</span>
            </p>
            <p className="p07__mdesc">{MOTION[f.keeper.motion]}</p>
          </div>
        ))}
      </div>
    </Plate>
  )
}

/* ---------- 08 · specimen & basket ---------- */

function P08() {
  return (
    <Plate id="08" h={0} label="03 — Interaction · Specimen & basket">
      <div className="grid p08__top">
        <Title a="A specimen card" b="with a basket." size={104} />
        <p className="lede">
          The bottle can be turned by hand. Ingredients, nutrition, size and price read like a label. Add to basket and a small bottle hops into the
          nav; the basket counts down to free delivery and rolls its totals.
        </p>
      </div>
      <Shot n="shot-product-kiwi" w={1240} h={775} alt="Specimen section, kiwi" />
      <div className="p08__row">
        <figure>
          <Shot n="shot-cart" w={760} h={475} alt="Basket drawer with two items" radius={12} />
          <Cap k="Basket">250 ml + a crate of six — free delivery unlocked at €20.</Cap>
        </figure>
        <div className="p08__crops">
          <img src={shot('crop-ingredients')} alt="Ingredient bars" style={{ width: 456 }} />
          <img src={shot('crop-nutrition')} alt="Nutrition grid" style={{ width: 456 }} />
          <img src={shot('crop-buy')} alt="Size selector and price" style={{ width: 456 }} />
        </div>
      </div>
    </Plate>
  )
}

/* ---------- 09 · field notes & ritual ---------- */

const CHAPTERS = [
  ['I', 'Moss', 'The orchard moves at night.'],
  ['II', 'Marmalade', 'So the creatures watch.'],
  ['III', 'Vesper', 'Cherries ripen in the dark.'],
  ['IV', 'Pip', 'Pip never noticed the river left.'],
]

function P09() {
  const theme = { bg: KIWI.palette.ink, ink: KIWI.palette.bg }
  return (
    <Plate id="09" h={0} theme={theme} label="03 — Interaction · Scroll" className="p09">
      <div className="grid p09__top">
        <Title a="Scroll does" b="the storytelling." size={104} />
        <p className="lede">
          Field notes run sideways through four chapters while the page is pinned. The ritual pins it again: a clock runs from picking to bottling
          and the bottle fills as you scroll.
        </p>
      </div>
      <div className="p09__track">
        {CHAPTERS.map(([r, k, t], i) => (
          <figure key={r}>
            <Shot n={`seq-story-${i + 1}`} w={608} h={380} alt={`Field notes, chapter ${r}`} radius={10} />
            <Cap k={`Chapter ${r} · ${k}`}>{t}</Cap>
          </figure>
        ))}
      </div>
      <div className="p09__progress">
        <i />
      </div>
      <div className="row3">
        {[
          ['0000', '00:07', 'Picked at first light'],
          ['0300', '03:00', 'Cold-pressed, slowly'],
          ['0600', '06:00', 'Bottled within six hours'],
        ].map(([n, t, c]) => (
          <figure key={n}>
            <Shot n={`shot-ritual-${n}`} w={397} h={248} alt={`Ritual at ${t}`} radius={10} />
            <Cap k={t}>{c}</Cap>
          </figure>
        ))}
      </div>
    </Plate>
  )
}

/* ---------- 10 · responsive ---------- */

function P10() {
  return (
    <Plate id="10" h={0} label="04 — Responsive">
      <div className="grid p10__top">
        <Title a="Desktop, tablet," b="mobile." size={104} />
        <p className="lede">
          On smaller screens the hero drops its secondary copy and the keeper line moves under the bottle. The story turns vertical, the basket
          becomes a bottom sheet you can drag closed, and a swipe switches worlds.
        </p>
      </div>
      <div className="p10__devices">
        <figure>
          <Shot n="shot-hero-cherry-desktop" w={660} h={412} alt="Desktop, 1440px" radius={12} />
          <Cap k="1440">Desktop</Cap>
        </figure>
        <figure>
          <Shot n="shot-hero-cherry-tablet" w={330} h={472} alt="Tablet, 834px" radius={20} />
          <Cap k="834">Tablet</Cap>
        </figure>
        <figure>
          <Shot n="shot-hero-cherry-mobile" w={200} h={433} alt="Mobile, 390px" radius={24} />
          <Cap k="390">Mobile</Cap>
        </figure>
      </div>
      <div className="p10__phones">
        {[
          ['shot-hero-kiwi-mobile', 'Hero · swipe to switch'],
          ['shot-product-kiwi-mobile', 'Specimen'],
          ['shot-cart-mobile', 'Basket · bottom sheet'],
          ['shot-menu-mobile', 'Menu'],
          ['shot-keepers-mobile', 'Bestiary'],
        ].map(([n, c]) => (
          <figure key={n}>
            <Shot n={n} w={228} h={494} alt={c} radius={26} />
            <Cap>{c}</Cap>
          </figure>
        ))}
      </div>
    </Plate>
  )
}

/* ---------- 11 · details ---------- */

function P11() {
  const theme = { bg: KIWI.palette.bg, ink: KIWI.palette.ink }
  return (
    <Plate id="11" h={0} theme={theme} label="05 — Final result · Details" className="p11">
      <div className="grid p11__top">
        <Title a="Small parts," b="same world." size={104} />
        <p className="lede">Every component reads the active palette, so the same switcher, chip and stepper exist in four colourways without a single variant.</p>
      </div>
      <figure className="p11__nav">
        <img src={shot('crop-nav')} alt="Navigation" style={{ width: 1240 }} />
        <Cap k="Nav">Pill links, basket counter that pops when something lands in it.</Cap>
      </figure>
      <div className="p11__grid">
        <figure style={{ gridArea: 'sw' }}>
          <img src={shot('crop-switcher')} alt="Flavor switcher" style={{ width: 646 }} />
          <Cap k="Switcher">Thumbnail bottles, autoplay progress, arrow keys and swipe.</Cap>
        </figure>
        <figure style={{ gridArea: 'chip' }}>
          <img src={shot('crop-keeper-chip')} alt="Keeper chip" style={{ width: 426 }} />
          <Cap k="Keeper chip">Rewritten for every world.</Cap>
        </figure>
        <figure style={{ gridArea: 'btn' }}>
          <img src={shot('crop-button')} alt="Primary button" style={{ width: 295 }} />
          <Cap k="Button">Arrow turns −45° on hover.</Cap>
        </figure>
        <figure style={{ gridArea: 'pill' }}>
          <img src={shot('crop-basket-pill')} alt="Basket counter" style={{ width: 200 }} />
          <Cap k="Counter">Elastic pop on add.</Cap>
        </figure>
        <figure style={{ gridArea: 'sp' }}>
          <img src={shot('crop-specimen')} alt="Rotating specimen" style={{ width: 560 }} />
          <Cap k="Specimen">Drag to turn; the orbit text names the keeper.</Cap>
        </figure>
        <figure style={{ gridArea: 'item' }}>
          <img src={shot('crop-cart-item')} alt="Basket item with stepper" style={{ width: 640 }} />
          <Cap k="Basket item">Digits slide in the direction of the change.</Cap>
        </figure>
        <figure style={{ gridArea: 'foot' }}>
          <img src={shot('crop-cart-foot')} alt="Basket totals" style={{ width: 640 }} />
          <Cap k="Totals">Free-delivery bar and rolling numbers.</Cap>
        </figure>
      </div>
    </Plate>
  )
}

/* ---------- 12 · result ---------- */

function P12() {
  const theme = { bg: KIWI.palette.ink, ink: KIWI.palette.bg }
  return (
    <Plate id="12" h={0} theme={theme} label="05 — Final result" className="p12">
      <div className="grid p12__top">
        <Title a="Visit" b="the orchard." size={150} />
        <div>
          <p className="lede">
            A complete, working brand experience: four worlds, four keepers, a functioning basket and a story told through scroll. Built in React with
            GSAP and live on Vercel.
          </p>
          <p className="p12__note mono">Odd Orchard is a fictional brand. Checkout is a placeholder.</p>
        </div>
      </div>
      <a className="p12__cta" href={`https://${LIVE}`}>
        {LIVE}
        <span aria-hidden="true">→</span>
      </a>
      <dl className="p12__credits">
        <div>
          <dt className="mono">Role</dt>
          <dd>Concept, art direction, UX/UI design, AI visual creation, front-end development</dd>
        </div>
        <div>
          <dt className="mono">Design</dt>
          <dd>Marta Jakovleva</dd>
        </div>
        <div>
          <dt className="mono">Development</dt>
          <dd>React 19, Vite, GSAP + ScrollTrigger, Lenis · AI-assisted with Claude Code</dd>
        </div>
        <div>
          <dt className="mono">Tools</dt>
          <dd>Higgsfield (GPT Image 2.5), Python + Pillow, GitHub, Vercel</dd>
        </div>
      </dl>
      <Shot n="shot-footer" w={1240} h={620} pos="bottom center" alt="Footer with the giant wordmark and peeking keepers" />
    </Plate>
  )
}

/* ---------- cover · 808 × 632 ---------- */

function Cover() {
  const f = CHERRY
  return (
    <section className="cover" id="plate-cover" data-plate="cover" style={pal(f)}>
      <span className="cover__word" aria-hidden="true">
        {f.word}
      </span>
      <div className="cover__logo">
        <Logo />
      </div>
      <span className="cover__no mono">Nº {f.no} / 04</span>
      <Specimen f={f} h={420} className="cover__sp" />
      <p className="cover__line">
        Every flavor <em>has a keeper.</em>
      </p>
    </section>
  )
}

// Plate components keep their original ids (stable URLs: ?plate=NN); the printed
// number comes from the order here, so removing a plate renumbers the rest.
const PLATES = { '01': P01, '03': P03, '04': P04, '05': P05, '06': P06, '07': P07, '08': P08, '09': P09, '10': P10, '11': P11, '12': P12 }

// Sorted explicitly: '10'–'12' are integer-like keys, which JS objects list first.
const ORDER = Object.keys(PLATES).sort()
const TOTAL = String(ORDER.length).padStart(2, '0')
const plateNo = (id) => String(ORDER.indexOf(id) + 1).padStart(2, '0')

export default function Case({ only }) {
  if (only === 'cover') return <Cover />
  if (only && PLATES[only]) {
    const P = PLATES[only]
    return <P />
  }
  return (
    <>
      <nav className="bar">
        <span className="bar__name">
          <Logo /> <span className="mono">Behance case study</span>
        </span>
        <span className="bar__links mono">
          {ORDER.map((k) => (
            <a key={k} href={`#plate-${k}`}>
              {plateNo(k)}
            </a>
          ))}
          <a href="#plate-cover">cover</a>
        </span>
        <a className="bar__live mono" href="/">
          Live site ↗
        </a>
      </nav>
      <main className="stack">
        {ORDER.map((k) => {
          const P = PLATES[k]
          return <P key={k} />
        })}
        <div className="cover-wrap">
          <p className="mono">Behance cover · 808 × 632</p>
          <Cover />
        </div>
      </main>
    </>
  )
}
