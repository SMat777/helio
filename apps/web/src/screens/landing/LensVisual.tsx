// Live mini-renders for the three lenses — real components, not screenshots.
// Self-contained (inline slice + band logic) so the landing chunk stays light.
// Each render is wrapped role="img" + aria-label: the visual itself is decorative
// to assistive tech, the label carries the meaning.

type Lens = 'matrix' | 'table' | 'cards'

const BAND = {
  Critical: { bg: '#c14b2a', text: '#fff' },
  Elevated: { bg: '#d4a23a', text: '#16130f' },
  Watch:    { bg: '#a8a085', text: '#16130f' },
  Low:      { bg: '#1f3a5f', text: '#fff' },
} as const
type BandName = keyof typeof BAND

function band(score: number): BandName {
  if (score >= 75) return 'Critical'
  if (score >= 65) return 'Elevated'
  if (score >= 40) return 'Watch'
  return 'Low'
}

type Row = { name: string; id: string; cat: string; seg: Segment; score: number; onTime: number }
type Segment = 'Strategic' | 'Bottleneck' | 'Leverage' | 'Routine'

const SUPPLIERS: Row[] = [
  { name: 'Cascade Polymers', id: 'SUP-632', cat: 'Packaging',   seg: 'Strategic',  score: 90, onTime: 71 },
  { name: 'Heliox Polymers',  id: 'SUP-184', cat: 'Chemicals',   seg: 'Strategic',  score: 76, onTime: 82 },
  { name: 'Quanta Packaging', id: 'SUP-415', cat: 'Packaging',   seg: 'Bottleneck', score: 81, onTime: 64 },
  { name: 'Factory Yeo',      id: 'SUP-091', cat: 'Electronics', seg: 'Bottleneck', score: 71, onTime: 77 },
  { name: 'NorPack',          id: 'SUP-112', cat: 'Logistics',   seg: 'Leverage',   score: 64, onTime: 88 },
  { name: 'Lima Steel',       id: 'SUP-203', cat: 'Metals',      seg: 'Leverage',   score: 52, onTime: 91 },
  { name: 'DS-Smith',         id: 'SUP-507', cat: 'Packaging',   seg: 'Routine',    score: 44, onTime: 94 },
  { name: 'BASF Coatings',    id: 'SUP-318', cat: 'Chemicals',   seg: 'Routine',    score: 38, onTime: 96 },
]

const LABELS: Record<Lens, string> = {
  matrix: 'Kraljic matrix showing supplier distribution across Strategic, Bottleneck, Leverage, and Routine, colored by risk band',
  table: 'Sortable supplier table with name, category, a risk-band badge, and on-time percentage',
  cards: 'Supplier cards grid with color-coded risk scores',
}

const SEGMENTS: Segment[] = ['Strategic', 'Bottleneck', 'Leverage', 'Routine']
const SEG_SUB: Record<Segment, string> = {
  Strategic: 'high impact · high risk',
  Bottleneck: 'low impact · high risk',
  Leverage: 'high impact · low risk',
  Routine: 'low impact · low risk',
}

function MatrixView() {
  return (
    <div className="lv-matrix" aria-hidden="true">
      {SEGMENTS.map((seg) => {
        const rows = SUPPLIERS.filter((s) => s.seg === seg).sort((a, b) => b.score - a.score)
        return (
          <div key={seg} className="lv-quad">
            <div className="lv-quad-head">
              <span className="lv-quad-name">{seg}</span>
              <span className="lv-quad-sub">{SEG_SUB[seg]}</span>
            </div>
            <div className="lv-quad-chips">
              {rows.map((s) => (
                <span key={s.id} className="lv-dot num" style={{ background: BAND[band(s.score)].bg, color: BAND[band(s.score)].text }}>
                  {s.score}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableView() {
  return (
    <div className="lv-table" aria-hidden="true">
      <div className="lv-thead">
        <span>Supplier</span><span>Category</span><span>Risk</span><span className="lv-num-h">On-time</span>
      </div>
      {SUPPLIERS.slice(0, 6).map((s) => {
        const b = band(s.score)
        return (
          <div key={s.id} className="lv-trow">
            <span className="lv-name">{s.name}<span className="lv-id num">{s.id}</span></span>
            <span className="lv-cat">{s.cat}</span>
            <span><span className="lv-badge num" style={{ background: BAND[b].bg, color: BAND[b].text }}>{s.score}</span></span>
            <span className="lv-ontime num">{s.onTime}%</span>
          </div>
        )
      })}
    </div>
  )
}

function CardsView() {
  return (
    <div className="lv-cards" aria-hidden="true">
      {SUPPLIERS.slice(0, 6).map((s) => {
        const b = band(s.score)
        return (
          <div key={s.id} className="lv-card" style={{ borderTopColor: BAND[b].bg }}>
            <div className="lv-card-top">
              <span className="lv-card-name">{s.name}</span>
              <span className="lv-card-score num" style={{ color: BAND[b].bg }}>{s.score}</span>
            </div>
            <div className="lv-card-meta num">{s.id} · {s.cat}</div>
            <span className="lv-card-seg">{s.seg}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function LensVisual({ kind }: { kind: Lens }) {
  return (
    <div className="lens-render" role="img" aria-label={LABELS[kind]}>
      {kind === 'matrix' && <MatrixView />}
      {kind === 'table' && <TableView />}
      {kind === 'cards' && <CardsView />}
    </div>
  )
}
