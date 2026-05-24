import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { riskColor } from '../lib/risk'
import { getSuppliers, getSegmentExposure, type Supplier, type Segment, type SegmentExposure } from '../lib/data'

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

// "€48.2M" style — millions, one decimal (segment totals come as raw EUR).
const eur = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
function fmtSpendM(spendEur: number): string {
  return `€${eur.format(spendEur / 1e6)}M`
}

// ── Matrix view ─────────────────────────────────────────────────────────────
// One compact, clickable row per supplier inside its segment column (kilde: V6MatrixCard).
function MatrixRow({ s }: { s: Supplier }) {
  const color = riskColor(s.riskScore)
  return (
    <Link
      to={`/suppliers/${s.id}`}
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

function MatrixColumn({ exposure, suppliers }: { exposure: SegmentExposure; suppliers: Supplier[] }) {
  const { segment, count } = exposure
  const hue = SEGMENT_HUE[segment]
  const rows = suppliers
    .filter((s) => s.segment === segment)
    .sort((a, b) => b.riskScore - a.riskScore)
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
          <span className="font-mono text-[12px] font-medium tabular-nums text-ink">{fmtSpendM(exposure.spendEur)}</span>
          <span className="font-mono text-[10.5px] tabular-nums" style={{ color: riskColor(exposure.avgRisk) }}>
            avg {exposure.avgRisk}
          </span>
        </div>
      </div>
      {/* Column body — scrollable list, highest risk first. */}
      <div className="flex max-h-[calc(100vh-260px)] flex-col gap-1.5 overflow-auto p-2.5">
        {rows.length > 0 ? (
          rows.map((s) => <MatrixRow key={s.id} s={s} />)
        ) : (
          <div className="py-5 text-center text-[12px] text-ink-4">none</div>
        )}
      </div>
    </Card>
  )
}

function MatrixView({ suppliers, exposure }: { suppliers: Supplier[]; exposure: SegmentExposure[] }) {
  const byId = useMemo(() => new Map(exposure.map((e) => [e.segment, e])), [exposure])
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
        {SEGMENTS.map((seg) => {
          const e = byId.get(seg)
          if (!e) return null
          return <MatrixColumn key={seg} exposure={e} suppliers={suppliers} />
        })}
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
                <Link to={`/suppliers/${s.id}`} className="block px-3 py-[9px] text-ink no-underline">
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
    <Link to={`/suppliers/${s.id}`} className="block no-underline">
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

export default function Suppliers() {
  const suppliers = getSuppliers()
  const exposure = getSegmentExposure()
  const [view, setView] = useState<ViewMode>('matrix')

  return (
    <AppShell
      slim
      crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Suppliers</>}
      actions={
        <>
          <Button><Icon name="export" /> Export CSV</Button>
          <Button variant="primary"><Icon name="plus" /> Add supplier</Button>
        </>
      }
    >
      <div className="px-6 py-4">
        {/* View toggle row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="font-mono text-[11px] tabular-nums text-ink-3">{suppliers.length} active</div>
          <SegmentToggle options={VIEW_OPTIONS} value={view} onChange={setView} />
        </div>

        {view === 'matrix' && <MatrixView suppliers={suppliers} exposure={exposure} />}
        {view === 'table' && <TableView suppliers={suppliers} />}
        {view === 'cards' && <CardsView suppliers={suppliers} />}
      </div>
    </AppShell>
  )
}
