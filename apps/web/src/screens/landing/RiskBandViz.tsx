// Band-ladder colors. Light bands use dark text to keep ≥ 4.5:1 (WCAG 1.4.3):
// - #c14b2a on white = 4.55:1 ✓ · #1f3a5f on white = 11.6:1 ✓
// - #d4a23a on white = 2.13:1 ✗ · #a8a085 on white = 2.74:1 ✗ → dark text
const BANDS = [
  { label: 'Critical', range: '> 75', color: '#c14b2a', text: '#fff' },
  { label: 'Elevated', range: '66–75', color: '#d4a23a', text: '#16130f' },
  { label: 'Watch',    range: '41–65', color: '#a8a085', text: '#16130f' },
  { label: 'Low',      range: '≤ 40', color: '#1f3a5f', text: '#fff' },
] as const

// Kraljic quadrants painted with the same band-colors — visualizes how the
// risk module drives every tile in the matrix (touchpoint #1).
const QUADRANTS = [
  { label: 'Strategic',  desc: 'High spend · High risk', color: '#c14b2a', text: '#fff' },
  { label: 'Bottleneck', desc: 'Low spend · High risk',  color: '#d4a23a', text: '#16130f' },
  { label: 'Leverage',   desc: 'High spend · Low risk',  color: '#a8a085', text: '#16130f' },
  { label: 'Routine',    desc: 'Low spend · Low risk',   color: '#1f3a5f', text: '#fff' },
] as const

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
        <div className="risk-left">
          <ul className="risk-ladder">
            {BANDS.map((b) => (
              <li key={b.label} style={{ background: b.color, color: b.text }}>
                <span className="band-label">{b.label}</span>
                <span className="band-range">{b.range}</span>
              </li>
            ))}
          </ul>
          <figure className="risk-chart">
            <img src="/screenshots/touch-chart-axis.png" alt="Scorecard trend chart with risk-band threshold line and y-axis ticks at the band boundaries" />
            <figcaption>Chart axis threshold</figcaption>
          </figure>
        </div>

        <div className="risk-right">
          <ul className="risk-quadrants" aria-label="Kraljic matrix tile colors">
            {QUADRANTS.map((q) => (
              <li key={q.label} style={{ background: q.color, color: q.text }}>
                <strong>{q.label}</strong>
                <span className="quadrant-desc">{q.desc}</span>
              </li>
            ))}
          </ul>
          <span className="touch-label">Matrix tile color</span>
        </div>
      </div>

      <div className="risk-bottom">
        <p className="risk-tag"><em>Change a threshold. Everything updates.</em></p>
        <ul className="risk-pills">
          <li>Pure derivation</li>
          <li>No drift</li>
          <li>Tested without React</li>
        </ul>
      </div>
    </section>
  )
}
