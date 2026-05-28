// Text color paired with each band background. Light bands use dark text to
// keep contrast ≥ 4.5:1 (WCAG 1.4.3). Computed at locked-palette time:
// - #c14b2a on white = 4.55:1 ✓ · #1f3a5f on white = 11.6:1 ✓
// - #d4a23a on white = 2.13:1 ✗ · #a8a085 on white = 2.74:1 ✗ → use dark text
const BANDS = [
  { label: 'Critical', range: '> 75', color: '#c14b2a', text: '#fff' },
  { label: 'Elevated', range: '66–75', color: '#d4a23a', text: '#16130f' },
  { label: 'Watch',    range: '41–65', color: '#a8a085', text: '#16130f' },
  { label: 'Low',      range: '≤ 40', color: '#1f3a5f', text: '#fff' },
] as const

const TOUCHPOINTS = [
  { label: 'Matrix tile color', image: '/screenshots/touch-matrix-tile.png', alt: 'Kraljic matrix tile colored by risk band' },
  { label: 'Table cell badge', image: '/screenshots/touch-table-badge.png', alt: 'Supplier table row with risk-band badge' },
  { label: 'Chart axis threshold', image: '/screenshots/touch-chart-axis.png', alt: 'Chart with risk-band axis thresholds' },
  { label: 'Supplier-detail header', image: '/screenshots/touch-supplier-header.png', alt: 'Supplier detail page header with risk-band indicator' },
]

export default function RiskBandViz() {
  return (
    <section className="risk" id="risk" aria-labelledby="risk-h" data-testid="landing-risk">
      <header className="section-head">
        <h2 id="risk-h">One risk module. <span className="accent">Every color, badge, threshold.</span></h2>
        <p className="section-lead">
          Risk bands at 40 / 65 / 75 live in <code>lib/risk.ts</code>. Every UI surface that shows risk — matrix colors, table cells, badge labels, chart axes — references the same constants. Move a threshold, the whole portfolio reflows.
        </p>
      </header>

      <div className="risk-viz">
        <ul className="risk-ladder">
          {BANDS.map((b) => (
            <li key={b.label} style={{ background: b.color, color: b.text }}>
              <span className="band-label">{b.label}</span>
              <span className="band-range">{b.range}</span>
            </li>
          ))}
        </ul>
        <ul className="risk-touch">
          {TOUCHPOINTS.map((t) => (
            <li key={t.label}>
              <figure className="touch-img">
                <img src={t.image} alt={t.alt} />
              </figure>
              <span className="touch-label">{t.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="risk-tag"><em>Change a threshold. Everything updates.</em></p>

      <ul className="risk-pills">
        <li>Pure derivation</li>
        <li>No drift</li>
        <li>Tested without React</li>
      </ul>
    </section>
  )
}
