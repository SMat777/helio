import { useState, useRef, type KeyboardEvent } from 'react'

type Lens = 'matrix' | 'table' | 'cards'

const LENSES: Record<Lens, { label: string; image: string; alt: string; question: string; caption: string }> = {
  matrix: {
    label: 'Kraljic matrix',
    image: '/screenshots/matrix-tight.png',
    alt: 'Kraljic matrix showing supplier distribution across Strategic, Bottleneck, Leverage, Routine',
    question: 'Where does structural risk concentrate?',
    caption: 'Strategic and Bottleneck columns carry the structural risk. Within each column, suppliers sort by current score — high-risk floats to the top, ready for next week\'s review meeting.',
  },
  table: {
    label: 'Sortable table',
    image: '/screenshots/table-tight.png',
    alt: 'Sortable supplier table with columns for name, category, risk, on-time, quality',
    question: 'Which suppliers need attention this week?',
    caption: 'Sort by risk delta, on-time %, or quality 90D. Filter by category, region, or band.',
  },
  cards: {
    label: 'Visual cards',
    image: '/screenshots/cards-tight.png',
    alt: 'Supplier cards grid with color-coded risk indicators',
    question: 'Quick visual triage by category.',
    caption: 'Color-coded, scannable. Best for the daily standup or the contracts review.',
  },
}

const LENS_KEYS: Lens[] = ['matrix', 'table', 'cards']

export default function LensTabs() {
  const [active, setActive] = useState<Lens>('matrix')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const idx = LENS_KEYS.indexOf(active)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const n = (idx + 1) % 3
      setActive(LENS_KEYS[n])
      tabRefs.current[n]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = (idx + 2) % 3
      setActive(LENS_KEYS[n])
      tabRefs.current[n]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive('matrix')
      tabRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive('cards')
      tabRefs.current[2]?.focus()
    }
  }

  const lens = LENSES[active]

  return (
    <section className="lenses" id="lenses" aria-labelledby="lenses-h" data-testid="landing-lenses">
      <header className="section-head">
        <h2 id="lenses-h">One portfolio. <span className="accent">Three lenses.</span></h2>
        <p className="section-lead">Same 247 suppliers and the same risk model behind all three. The view changes; the data doesn't.</p>
      </header>

      <div
        className="lens-tabs"
        role="tablist"
        aria-label="Supplier portfolio views"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {LENS_KEYS.map((key, i) => (
          <button
            key={key}
            ref={(el) => { tabRefs.current[i] = el }}
            id={`tab-${key}`}
            role="tab"
            aria-selected={active === key}
            aria-controls={`panel-${key}`}
            tabIndex={active === key ? 0 : -1}
            className={`lens-tab ${active === key ? 'active' : ''}`}
            onClick={() => setActive(key)}
          >
            {LENSES[key].label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${active}`}
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
        className="lens-body lens-active"
      >
        <figure className="lens-vis">
          <img src={lens.image} alt={lens.alt} />
        </figure>
        <div className="lens-cap">
          <span className="lens-q">What does this view answer?</span>
          <h3>{lens.question}</h3>
          <p>{lens.caption}</p>
        </div>
      </div>
    </section>
  )
}
