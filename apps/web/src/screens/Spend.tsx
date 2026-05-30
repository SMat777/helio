import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { SectionHead } from '../ui/SectionHead'
import { PageHead } from '../ui/PageHead'
import { HBarRow, HBarGroup } from '../ui/HBarRow'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { getSpendBreakdown, getConcentration, type SpendByKey, type ConcentrationPoint } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'
import { fmtMoney } from '../lib/format'

// Normalise bar widths to the largest item so the group fills the track.
function bars(items: SpendByKey[], max: number) {
  return items.map((it) => ({ ...it, w: max ? Math.round((it.eur / max) * 100) : 0 }))
}

// Pareto chart — spend bars (sorted desc) with a cumulative-share line and an
// 80% reference. Pure SVG, scales to container width via viewBox.
function ParetoChart({ points }: { points: ConcentrationPoint[] }) {
  const W = 760, H = 200, padL = 8, padR = 8, padT = 16, padB = 22
  const plotW = W - padL - padR, plotH = H - padT - padB
  const n = points.length
  const slot = plotW / Math.max(n, 1)
  const barW = slot * 0.58
  const maxShare = Math.max(...points.map((p) => p.sharePct), 1)
  const yCum = (pct: number) => padT + plotH - (pct / 100) * plotH
  const cx = (i: number) => padL + slot * i + slot / 2
  const line = points.map((p, i) => `${cx(i).toFixed(1)},${yCum(p.cumPct).toFixed(1)}`).join(' ')
  const y80 = yCum(80)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
      aria-label={`Pareto chart: top ${n} suppliers by spend with cumulative share reaching ${points[n - 1]?.cumPct.toFixed(0)} percent`}>
      {/* 80% reference */}
      <line x1={padL} y1={y80} x2={W - padR} y2={y80} stroke="var(--ink-4)" strokeWidth="1" strokeDasharray="4 4" />
      <text x={W - padR} y={y80 - 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">80% of spend</text>
      {/* bars (individual share) */}
      {points.map((p, i) => {
        const h = (p.sharePct / maxShare) * plotH
        return <rect key={p.id} x={padL + slot * i + (slot - barW) / 2} y={padT + plotH - h} width={barW} height={h} rx="2" fill="var(--accent)" opacity="0.8" />
      })}
      {/* cumulative line + dots */}
      <polyline points={line} fill="none" stroke="var(--cta)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => <circle key={p.id} cx={cx(i)} cy={yCum(p.cumPct)} r="2.6" fill="var(--cta)" />)}
      {/* baseline */}
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--line)" strokeWidth="1" />
    </svg>
  )
}

export default function Spend() {
  const { data: suppliers = [] } = useSuppliersQuery()
  const data = useMemo(() => getSpendBreakdown(suppliers), [suppliers])
  const con = useMemo(() => getConcentration(suppliers), [suppliers])
  const segMax = Math.max(...data.bySegment.map((s) => s.eur), 1)
  const catMax = Math.max(...data.byCategory.map((s) => s.eur), 1)
  const variance = data.ytdEur - data.budgetEur

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Spend</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Reports · Spend analysis"
          title="Where the money goes."
          lede="Annual spend split by Kraljic segment and category, with the suppliers that move the needle. Read it next to risk — high spend on high risk is where leverage matters most."
        />

        <Card flat className="mb-6 grid grid-cols-4">
          <div className="border-r border-line"><KPI label="Spend YTD" value={fmtMoney(data.ytdEur)} note="this year" /></div>
          <div className="border-r border-line"><KPI label="Budget" value={fmtMoney(data.budgetEur)} note="full year" /></div>
          <div className="border-r border-line">
            <KPI label="vs budget" value={`${variance < 0 ? '−' : '+'}${fmtMoney(Math.abs(variance))}`} dir={variance < 0 ? 'up' : 'down'} delta={variance < 0 ? 'under budget' : 'over budget'} />
          </div>
          <div><KPI label="Annualised" value={fmtMoney(data.totalEur)} note="all suppliers" /></div>
        </Card>

        <Card flat className="mb-6 px-5 py-4">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h3 className="m-0 text-[15px] font-semibold tracking-[-0.005em]">Budget utilization</h3>
            <span className="font-mono text-[12.5px] text-ink-3">{fmtMoney(data.ytdEur)} of {fmtMoney(data.budgetEur)} · {Math.round((data.ytdEur / data.budgetEur) * 100)}%</span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (data.ytdEur / data.budgetEur) * 100)}%`, background: variance < 0 ? 'var(--good)' : 'var(--bad)' }} />
          </div>
          <div className="mt-2 font-mono text-[11.5px] text-ink-4">
            {variance < 0 ? `${fmtMoney(Math.abs(variance))} headroom remaining this year` : `${fmtMoney(variance)} over budget`}
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card flat className="px-5 pt-4 pb-5">
            <SectionHead>By segment</SectionHead>
            <HBarGroup>
              {bars(data.bySegment, segMax).map((s) => (
                <HBarRow key={s.key} label={s.key} value={fmtMoney(s.eur)} pct={s.w} tone="accent" />
              ))}
            </HBarGroup>
          </Card>
          <Card flat className="px-5 pt-4 pb-5">
            <SectionHead>By category</SectionHead>
            <HBarGroup>
              {bars(data.byCategory.slice(0, 6), catMax).map((s) => (
                <HBarRow key={s.key} label={s.key} value={fmtMoney(s.eur)} pct={s.w} tone="accent" />
              ))}
            </HBarGroup>
          </Card>
        </div>

        <SectionHead>Concentration &amp; dependency</SectionHead>
        <Card flat className="mb-4 grid grid-cols-3">
          <div className="border-r border-line"><KPI label="Top 10 suppliers" value={con.top10Pct.toFixed(0)} unit="%" note="of total spend" /></div>
          <div className="border-r border-line"><KPI label="80% of spend" value={con.pareto80N} note={`of ${suppliers.length} suppliers`} /></div>
          <div><KPI label="Single-source" value={con.singleSourceCount} note={`${fmtMoney(con.singleSourceEur)} exposed`} /></div>
        </Card>

        <Card flat className="mb-4 px-5 py-4">
          <div className="mb-1 flex items-baseline justify-between">
            <h3 className="m-0 text-[15px] font-semibold tracking-[-0.005em]">Spend Pareto</h3>
            <span className="font-mono text-[11.5px] text-ink-3">top {con.points.length} shown · cumulative to {con.points[con.points.length - 1]?.cumPct.toFixed(0)}%</span>
          </div>
          <p className="mb-3 max-w-[68ch] text-[12.5px] leading-[1.5] text-ink-3">
            Bars are each supplier&apos;s share; the line is the running cumulative. Read where it bends —
            the first <b className="font-semibold text-ink">{con.pareto80N}</b> of {suppliers.length} suppliers
            carry 80% of spend, and the top 5 carry <b className="font-semibold text-ink">{con.top5Pct.toFixed(0)}%</b>.
          </p>
          <ParetoChart points={con.points} />
        </Card>

        {con.singleSource.length > 0 && (
          <Card flat className="mb-6 px-5 py-4">
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="m-0 text-[15px] font-semibold tracking-[-0.005em]">Single-source exposure</h3>
              <span className="font-mono text-[11.5px] text-ink-3">{con.singleSourceCount} categories · one supplier each</span>
            </div>
            <p className="mb-3 max-w-[68ch] text-[12.5px] leading-[1.5] text-ink-3">
              Categories where one supplier is the only source — the dependencies a disruption hits hardest. Largest by spend:
            </p>
            <div className="flex flex-col gap-1.5">
              {con.singleSource.map((s) => (
                <Link key={s.id} to={`/app/suppliers/${s.id}`} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-3 rounded-md border border-line bg-paper-2 px-3 py-2 no-underline" style={{ borderLeft: '3px solid var(--bad)' }}>
                  <span className="text-[13.5px] font-medium text-ink">{s.category}</span>
                  <span className="text-[12.5px] text-ink-2">{s.supplier}</span>
                  <span className="font-mono text-[12.5px] tabular-nums text-ink">{fmtMoney(s.eur)}</span>
                </Link>
              ))}
            </div>
          </Card>
        )}

        <SectionHead>Top suppliers by spend</SectionHead>
        <Card flat className="overflow-hidden">
          <Table>
            <THead>
              <Tr><Th>Supplier</Th><Th numeric>Spend</Th><Th numeric>Share of total</Th></Tr>
            </THead>
            <TBody>
              {data.topSuppliers.map((s) => (
                <Tr key={s.id}>
                  <Td variant="name" className="p-0">
                    <Link to={`/app/suppliers/${s.id}`} className="block px-3 py-2.5 text-ink no-underline">
                      <span className="text-[14.5px] font-semibold">{s.name}</span>
                      <span className="mt-0.5 block font-mono text-[12px] font-normal text-ink-3">{s.id}</span>
                    </Link>
                  </Td>
                  <Td variant="num">{s.spend}</Td>
                  <Td variant="num">{((s.eur / data.totalEur) * 100).toFixed(1)}%</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  )
}
