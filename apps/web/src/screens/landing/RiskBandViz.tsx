import { useState } from 'react'

// Locked Helio risk-band palette (also the ladder swatches). Light bands carry
// dark text to keep ≥ 4.5:1 on their own fill (WCAG 1.4.3):
// - #c14b2a on white = 4.55:1, #1f3a5f on white = 11.6:1 → white text
// - #d4a23a = 2.13:1, #a8a085 = 2.74:1 → ink text
const BANDS = [
  { label: 'Critical', color: '#c14b2a', text: '#fff' },
  { label: 'Elevated', color: '#d4a23a', text: '#16130f' },
  { label: 'Watch',    color: '#a8a085', text: '#16130f' },
  { label: 'Low',      color: '#1f3a5f', text: '#fff' },
] as const

// Fixed lower thresholds (lib/risk.ts). Only the critical line is interactive —
// one line moving is enough to show the whole portfolio reflow.
const ELEVATED = 65
const WATCH = 40
const CRITICAL_MIN = 66
const CRITICAL_MAX = 90

// A representative portfolio slice, sorted high → low so the recolor boundary
// reads as a single line that slides with the threshold. Scores only — kept
// inline so the landing chunk never imports the 247-row seed.
const PORTFOLIO: { id: string; score: number }[] = [
  { id: 'SUP-184', score: 90 }, { id: 'SUP-632', score: 87 }, { id: 'SUP-091', score: 84 },
  { id: 'SUP-415', score: 81 }, { id: 'SUP-203', score: 79 }, { id: 'SUP-360', score: 77 },
  { id: 'SUP-112', score: 75 }, { id: 'SUP-528', score: 73 }, { id: 'SUP-104', score: 71 },
  { id: 'SUP-247', score: 69 }, { id: 'SUP-318', score: 67 }, { id: 'SUP-072', score: 66 },
  { id: 'SUP-590', score: 63 }, { id: 'SUP-156', score: 60 }, { id: 'SUP-441', score: 57 },
  { id: 'SUP-283', score: 54 }, { id: 'SUP-119', score: 51 }, { id: 'SUP-507', score: 47 },
  { id: 'SUP-338', score: 44 }, { id: 'SUP-261', score: 41 }, { id: 'SUP-085', score: 37 },
  { id: 'SUP-470', score: 33 }, { id: 'SUP-194', score: 29 }, { id: 'SUP-026', score: 24 },
]

function bandIndex(score: number, critical: number): number {
  if (score >= critical) return 0 // Critical
  if (score >= ELEVATED) return 1 // Elevated
  if (score >= WATCH) return 2    // Watch
  return 3                        // Low
}

export default function RiskBandViz() {
  const [critical, setCritical] = useState(75)

  const ranges = [
    `≥ ${critical}`,
    `${ELEVATED}–${critical - 1}`,
    `${WATCH}–${ELEVATED - 1}`,
    `< ${WATCH}`,
  ]

  const counts = [0, 0, 0, 0]
  for (const s of PORTFOLIO) counts[bandIndex(s.score, critical)]++

  return (
    <section className="risk" id="risk" aria-labelledby="risk-h" data-testid="landing-risk">
      <header className="section-head">
        <h2 id="risk-h">One risk module. <span className="accent">Every color, badge, threshold.</span></h2>
        <p className="section-lead">
          Risk bands at 40 / 65 / 75 live in <code>lib/risk.ts</code>. Every UI surface that shows
          risk — matrix colors, table cells, badge labels, chart axes — derives from the same
          constants. <em>Drag the critical line and the whole portfolio reflows.</em>
        </p>
      </header>

      <div className="risk-board">
        {/* Live band-ladder — ranges recompute as the critical line moves. */}
        <ul className="risk-ladder" aria-hidden="true">
          {BANDS.map((b, i) => (
            <li key={b.label} style={{ background: b.color, color: b.text }}>
              <span className="band-label">{b.label}</span>
              <span className="band-range num">{ranges[i]}</span>
            </li>
          ))}
        </ul>

        <div className="risk-live">
          <div className="risk-control">
            <label htmlFor="critical-threshold" className="risk-control-top">
              <span className="risk-control-label">Critical threshold</span>
              <span className="risk-control-val num" style={{ color: BANDS[0].color }}>{critical}</span>
            </label>
            <input
              id="critical-threshold"
              type="range"
              min={CRITICAL_MIN}
              max={CRITICAL_MAX}
              step={1}
              value={critical}
              onChange={(e) => setCritical(Number(e.target.value))}
              className="risk-slider"
              aria-label="Critical risk threshold"
              aria-valuetext={`Critical at ${critical}`}
            />
            <p className="risk-control-hint num">
              {counts[0]} of {PORTFOLIO.length} suppliers sit at or above the critical line.
            </p>
          </div>

          <ul className="risk-cloud" aria-hidden="true">
            {PORTFOLIO.map((s) => {
              const b = BANDS[bandIndex(s.score, critical)]
              return (
                <li
                  key={s.id}
                  className="risk-chip num"
                  style={{ background: b.color, color: b.text }}
                  title={`${s.id} · ${b.label}`}
                >
                  {s.score}
                </li>
              )
            })}
          </ul>

          <dl className="risk-counts" aria-live="polite">
            {BANDS.map((b, i) => (
              <div key={b.label} className="risk-count">
                <dt>
                  <span className="risk-count-dot" style={{ background: b.color }} aria-hidden="true" />
                  {b.label}
                </dt>
                <dd className="risk-count-n num">{counts[i]}</dd>
              </div>
            ))}
          </dl>
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
