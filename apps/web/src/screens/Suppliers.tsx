import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { Pill, type PillTone } from '../ui/Pill'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Flag } from '../ui/Flag'
import { RiskScore } from '../ui/RiskScore'
import { Sparkline } from '../ui/Sparkline'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { SegmentToggle, type SegOption } from '../ui/SegmentToggle'
import { riskBand, riskColor, type RiskBand } from '../lib/risk'
import { type Supplier, type Segment } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'
import { toCsv, downloadCsv } from '../lib/csv'
import { fmtMoneyM } from '../lib/format'

// View modes for the SegmentToggle (kilde: V6ViewToggle).
type ViewMode = 'matrix' | 'table' | 'cards'
const VIEW_OPTIONS: SegOption<ViewMode>[] = [
  { id: 'matrix', label: 'Matrix' },
  { id: 'table', label: 'Table' },
  { id: 'cards', label: 'Cards' },
]

// Kraljic segments in portfolio order (kilde: V6MatrixBody segments).
const SEGMENTS: Segment[] = ['Strategic', 'Bottleneck', 'Leverage', 'Routine']

// Segment → semantic mapping (kilde: SEGMENT_COLOR i mockup-suppliers.jsx).
// Strategic=accent, Bottleneck=bad, Leverage=good, Routine=neutral.
const SEGMENT_PILL: Record<Segment, PillTone> = {
  Strategic: 'outline',
  Bottleneck: 'bad',
  Leverage: 'good',
  Routine: 'muted',
}
const SEGMENT_HUE: Record<Segment, string> = {
  Strategic: 'var(--accent)',
  Bottleneck: 'var(--bad)',
  Leverage: 'var(--good)',
  Routine: 'var(--ink-4)',
}
const SEGMENT_SUB: Record<Segment, string> = {
  Strategic: 'High spend · High risk',
  Bottleneck: 'Low spend · High risk',
  Leverage: 'High spend · Low risk',
  Routine: 'Low spend · Low risk',
}

// ── Matrix view ─────────────────────────────────────────────────────────────
// One compact, clickable row per supplier inside its segment column (kilde: V6MatrixCard).
function MatrixRow({ s }: { s: Supplier }) {
  const color = riskColor(s.riskScore)
  return (
    <Link
      to={`/app/suppliers/${s.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-[7px] border border-line bg-card px-3 py-2 no-underline"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      <div className="min-w-0">
        <div className="truncate text-[12.5px] font-medium leading-tight text-ink">{s.name}</div>
        <div className="mt-0.5 font-mono text-[10.5px] text-ink-3">{s.id} · {s.spend}</div>
      </div>
      <span className="text-right font-mono text-[14px] font-semibold tabular-nums" style={{ color }}>
        {s.riskScore}
      </span>
    </Link>
  )
}

// Column stats are derived from the rows it receives, so headers always agree
// with the (possibly filtered) body — no separate exposure source to drift from.
function MatrixColumn({ segment, rows }: { segment: Segment; rows: Supplier[] }) {
  const hue = SEGMENT_HUE[segment]
  const count = rows.length
  const spendEur = rows.reduce((sum, r) => sum + r.spendEur, 0)
  const avgRisk = count ? Math.round(rows.reduce((sum, r) => sum + r.riskScore, 0) / count) : 0
  return (
    <Card flat className="flex flex-col overflow-hidden">
      {/* Column header — count + total spend + avg risk (kilde: V6 column header). */}
      <div className="border-b border-line px-4 pt-3.5 pb-3" style={{ borderTop: `2px solid ${hue}` }}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="m-0 font-serif text-[18px] leading-none tracking-[-0.01em]">{segment}</h3>
          <span className="font-mono text-[11px] tabular-nums text-ink-3">{count}</span>
        </div>
        <div className="mb-2.5 font-mono text-[10.5px] tracking-[0.04em] text-ink-3">{SEGMENT_SUB[segment]}</div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[12px] font-medium tabular-nums text-ink">{fmtMoneyM(spendEur)}</span>
          <span className="font-mono text-[10.5px] tabular-nums" style={{ color: riskColor(avgRisk) }}>
            avg {avgRisk}
          </span>
        </div>
      </div>
      {/* Column body — scrollable list, highest risk first. */}
      <div className="flex max-h-[calc(100vh-320px)] flex-col gap-1.5 overflow-auto p-2.5">
        {rows.length > 0 ? (
          rows.map((s) => <MatrixRow key={s.id} s={s} />)
        ) : (
          <div className="py-5 text-center text-[12px] text-ink-4">none</div>
        )}
      </div>
    </Card>
  )
}

function MatrixView({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div>
      {/* Hero strip (kilde: V6MatrixHero). */}
      <div className="mb-4">
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
          Portfolio view · Kraljic segmentation
        </div>
        <h2 className="m-0 font-serif text-[24px] leading-[1.15] tracking-[-0.02em]">
          Where your supplier risk is concentrated.
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-[13px] leading-[1.5] text-ink-2">
          Strategic and Bottleneck columns carry the conversations that matter — high risk where your
          exposure is structural. Sorted within each column by current risk score.
        </p>
      </div>
      <div className="grid grid-cols-4 items-start gap-3.5">
        {SEGMENTS.map((seg) => (
          <MatrixColumn
            key={seg}
            segment={seg}
            rows={suppliers.filter((s) => s.segment === seg).sort((a, b) => b.riskScore - a.riskScore)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Table view ──────────────────────────────────────────────────────────────
// Dense data table, sorted by risk descending (kilde: V6TableBody + mockup-suppliers dense table).
function TableView({ suppliers }: { suppliers: Supplier[] }) {
  const rows = useMemo(() => [...suppliers].sort((a, b) => b.riskScore - a.riskScore), [suppliers])
  return (
    <Card flat className="overflow-hidden">
      <Table>
        <THead>
          <Tr>
            <Th>Supplier</Th>
            <Th>Category</Th>
            <Th>Segment</Th>
            <Th>Country</Th>
            <Th numeric>Scorecard</Th>
            <Th className="w-[150px]">Risk</Th>
            <Th className="w-[100px]">Trend 12m</Th>
            <Th numeric>On-time</Th>
            <Th numeric>NCRs</Th>
            <Th numeric>Spend</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.map((s) => (
            <Tr key={s.id}>
              <Td variant="name" className="p-0">
                <Link to={`/app/suppliers/${s.id}`} className="block px-3 py-[9px] text-ink no-underline">
                  {s.name}
                  <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-3">{s.id} · Tier {s.tier}</span>
                </Link>
              </Td>
              <Td className="text-ink-2">{s.category}</Td>
              <Td><Pill tone={SEGMENT_PILL[s.segment]}>{s.segment}</Pill></Td>
              <Td><Flag code={s.country} /></Td>
              <Td variant="num">{s.scorecard}</Td>
              <Td><RiskScore score={s.riskScore} /></Td>
              <Td>
                <div className="h-7 w-[90px]">
                  <Sparkline data={s.trend} color={riskColor(s.riskScore)} height={28} area={false} />
                </div>
              </Td>
              <Td variant="num">{s.onTimePct}%</Td>
              <Td variant="num">
                {s.ncrs > 0
                  ? <span className="font-medium text-bad">{s.ncrs}</span>
                  : <span className="text-ink-4">—</span>}
              </Td>
              <Td variant="num">{s.spend}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

// ── Cards view ──────────────────────────────────────────────────────────────
// 3-column story-card grid (kilde: V6SupplierCard / mockup-suppliers cards).
function SupplierCard({ s }: { s: Supplier }) {
  const color = riskColor(s.riskScore)
  return (
    <Link to={`/app/suppliers/${s.id}`} className="block no-underline">
      <Card className="flex h-full flex-col px-4 py-4" style={{ borderLeft: `2px solid ${color}` }}>
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <div className="text-[14px] font-medium leading-tight tracking-[-0.005em] text-ink">{s.name}</div>
            <div className="mt-1 font-mono text-[11px] text-ink-3">
              <Flag code={s.country} />{s.id}
            </div>
          </div>
          <Pill tone={SEGMENT_PILL[s.segment]}>{s.segment}</Pill>
        </div>

        <div className="mb-3 text-[12px] text-ink-3">{s.category}</div>

        {/* Risk + sparkline */}
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">Risk</div>
            <RiskScore score={s.riskScore} />
          </div>
          <div className="h-7 w-[90px] opacity-80">
            <Sparkline data={s.trend} color={color} height={28} area={false} />
          </div>
        </div>

        {/* Metric strip */}
        <div className="mt-auto grid grid-cols-3 border-t border-line-2 pt-2.5">
          {([
            ['On-time', `${s.onTimePct}%`],
            ['Quality', `${s.qualityPct}%`],
            ['Scorecard', String(s.scorecard)],
          ] as const).map(([label, value]) => (
            <div key={label}>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-3">{label}</div>
              <div className="mt-0.5 font-mono text-[12.5px] font-medium tabular-nums text-ink">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  )
}

function CardsView({ suppliers }: { suppliers: Supplier[] }) {
  const rows = useMemo(() => [...suppliers].sort((a, b) => b.riskScore - a.riskScore), [suppliers])
  return (
    <div className="grid auto-rows-fr grid-cols-3 gap-3">
      {rows.map((s) => <SupplierCard key={s.id} s={s} />)}
    </div>
  )
}

// ── Filter bar ───────────────────────────────────────────────────────────────
const BANDS: RiskBand[] = ['Low', 'Watch', 'Elevated', 'Critical']

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.02em] ${
        active ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink-2 hover:bg-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function Suppliers() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: all = [], isLoading, isError, error } = useSuppliersQuery()
  const [view, setView] = useState<ViewMode>('matrix')
  // Seed filters from the URL so insights / drill-downs can deep-link a filtered view.
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const [segs, setSegs] = useState<Segment[]>(() => {
    const s = params.get('segment')
    return s && SEGMENTS.includes(s as Segment) ? [s as Segment] : []
  })
  const [bands, setBands] = useState<RiskBand[]>(() => {
    const b = params.get('band')
    return b && BANDS.includes(b as RiskBand) ? [b as RiskBand] : []
  })
  const [country, setCountry] = useState('')

  const countries = useMemo(() => [...new Set(all.map((s) => s.country))].sort(), [all])

  // Presentation filtering over the full set — the data accessor stays "fetch all".
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return all.filter((s) => {
      if (segs.length && !segs.includes(s.segment)) return false
      if (bands.length && !bands.includes(riskBand(s.riskScore))) return false
      if (country && s.country !== country) return false
      if (query && !`${s.name} ${s.id} ${s.category}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [all, q, segs, bands, country])

  const anyFilter = q.trim() !== '' || segs.length > 0 || bands.length > 0 || country !== ''
  function clear() {
    setQ('')
    setSegs([])
    setBands([])
    setCountry('')
  }

  // Export the currently filtered rows — a real download, not a decorative button.
  function exportCsv() {
    const headers = ['ID', 'Name', 'Country', 'Category', 'Segment', 'Tier', 'Scorecard', 'Risk', 'OnTime%', 'Quality', 'OpenNCRs', 'SpendEUR']
    const rows = filtered.map((s) => [s.id, s.name, s.country, s.category, s.segment, s.tier, s.scorecard, s.riskScore, s.onTimePct, s.qualityPct, s.ncrs, s.spendEur])
    downloadCsv(`helio-suppliers-${filtered.length}.csv`, toCsv(headers, rows))
  }

  return (
    <AppShell
      slim
      crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Suppliers</>}
      actions={
        <>
          <Button onClick={exportCsv}><Icon name="export" /> Export CSV</Button>
          <Button variant="primary" onClick={() => navigate('/app/suppliers/new')}><Icon name="plus" /> Add supplier</Button>
        </>
      }
    >
      <div className="px-6 py-4">
        {/* Count + view toggle */}
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[11px] tabular-nums text-ink-3">
            {filtered.length}{anyFilter ? ` of ${all.length}` : ''} active
          </div>
          <SegmentToggle options={VIEW_OPTIONS} value={view} onChange={setView} />
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-paper-2 px-3 py-2.5">
          <div className="relative">
            <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name, id, category…"
              className="w-[240px] rounded-md border border-line bg-card py-[5px] pr-2.5 pl-7 font-sans text-[12.5px] text-ink outline-none placeholder:text-ink-4 focus:border-line-3"
            />
          </div>

          <span className="mx-1 h-5 w-px bg-line" />
          {SEGMENTS.map((seg) => (
            <Chip key={seg} active={segs.includes(seg)} onClick={() => setSegs((a) => toggle(a, seg))}>{seg}</Chip>
          ))}

          <span className="mx-1 h-5 w-px bg-line" />
          {BANDS.map((b) => (
            <Chip key={b} active={bands.includes(b)} onClick={() => setBands((a) => toggle(a, b))}>{b}</Chip>
          ))}

          <span className="mx-1 h-5 w-px bg-line" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="cursor-pointer rounded-md border border-line bg-card px-2 py-[5px] font-mono text-[11.5px] text-ink-2 outline-none focus:border-line-3"
          >
            <option value="">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {anyFilter && (
            <button onClick={clear} className="ml-auto cursor-pointer rounded-md px-2 py-1 font-mono text-[11px] text-ink-3 hover:text-ink">
              Clear ✕
            </button>
          )}
        </div>

        {/* Loading / error / views or empty state */}
        {isLoading ? (
          <Card flat className="grid place-items-center px-6 py-20 text-center">
            <div className="font-mono text-[12.5px] text-ink-3">Loading suppliers…</div>
          </Card>
        ) : isError ? (
          <Card flat className="grid place-items-center px-6 py-20 text-center">
            <div>
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg border border-bad bg-card text-bad">
                <Icon name="warn" size={18} />
              </div>
              <div className="font-serif text-[20px] tracking-[-0.015em]">Could not load suppliers</div>
              <div className="mt-1 font-mono text-[11.5px] text-ink-3">{error instanceof Error ? error.message : 'Unknown error'}</div>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card flat className="grid place-items-center px-6 py-20 text-center">
            <div>
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg border border-line bg-card text-ink-3">
                <Icon name="filter" size={18} />
              </div>
              <div className="font-serif text-[20px] tracking-[-0.015em]">No suppliers match</div>
              <div className="mt-1 text-[12.5px] text-ink-3">Try loosening the filters.</div>
              <button onClick={clear} className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1.5 text-[12.5px] font-medium text-ink hover:bg-hover">
                Clear filters
              </button>
            </div>
          </Card>
        ) : (
          <>
            {view === 'matrix' && <MatrixView suppliers={filtered} />}
            {view === 'table' && <TableView suppliers={filtered} />}
            {view === 'cards' && <CardsView suppliers={filtered} />}
          </>
        )}
      </div>
    </AppShell>
  )
}
