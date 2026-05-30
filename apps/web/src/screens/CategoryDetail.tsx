import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Icon } from '../ui/Icon'
import { Pill, type PillTone } from '../ui/Pill'
import { Flag } from '../ui/Flag'
import { RiskScore } from '../ui/RiskScore'
import { RiskBand } from '../ui/RiskBand'
import { Sparkline } from '../ui/Sparkline'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { riskBand, riskColor } from '../lib/risk'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'
import { fmtMoney } from '../lib/format'
import type { Segment } from '../lib/types'

const SEGMENT_PILL: Record<Segment, PillTone> = {
  Strategic: 'outline', Bottleneck: 'bad', Leverage: 'good', Routine: 'muted',
}

const BANDS = [
  { label: 'Low', range: '0–40', color: 'var(--good)', test: (n: number) => riskBand(n) === 'Low' },
  { label: 'Watch', range: '40–65', color: 'var(--ink-4)', test: (n: number) => riskBand(n) === 'Watch' },
  { label: 'Elevated', range: '65–75', color: 'var(--warn)', test: (n: number) => riskBand(n) === 'Elevated' },
  { label: 'Critical', range: '75+', color: 'var(--bad)', test: (n: number) => riskBand(n) === 'Critical' },
]

export default function CategoryDetail() {
  const { key = '' } = useParams()
  const navigate = useNavigate()
  const category = decodeURIComponent(key)
  const { data: all = [] } = useSuppliersQuery()

  const rows = useMemo(
    () => all.filter((s) => s.category === category).sort((a, b) => b.riskScore - a.riskScore),
    [all, category],
  )

  const stats = useMemo(() => {
    const spend = rows.reduce((s, r) => s + r.spendEur, 0)
    const avgRisk = rows.length ? Math.round(rows.reduce((s, r) => s + r.riskScore, 0) / rows.length) : 0
    const atRisk = rows.filter((r) => r.riskScore >= 65).length
    const bands = BANDS.map((b) => ({ label: b.label, range: b.range, color: b.color, n: rows.filter((r) => b.test(r.riskScore)).length }))
    return { spend, avgRisk, atRisk, bands }
  }, [rows])

  const crumb = (
    <>
      <b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp;{' '}
      <Link to="/app/categories" className="text-accent no-underline hover:underline">Categories</Link> &nbsp;/&nbsp;{' '}
      <span className="text-ink-3">{category}</span>
    </>
  )

  if (rows.length === 0) {
    return (
      <AppShell slim crumb={crumb}>
        <div className="grid place-items-center px-6 py-24 text-center">
          <div>
            <div className="font-serif text-[22px] tracking-[-0.015em]">No suppliers in this category</div>
            <Link to="/app/categories" className="mt-4 inline-block font-mono text-[13px] text-accent no-underline hover:underline">← Back to categories</Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const avgColor = riskColor(stats.avgRisk)

  return (
    <AppShell slim crumb={crumb}>
      <div className="px-6 py-5">
        <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Spend category</div>
        <h1 className="m-0 font-serif text-[32px] leading-[1.05] tracking-[-0.02em] text-ink">{category}</h1>
        <p className="mt-2.5 max-w-[68ch] text-[15px] leading-[1.55] text-ink-2">
          {rows.length} supplier{rows.length === 1 ? '' : 's'} in this category, average risk{' '}
          <b className="font-semibold" style={{ color: avgColor }}>{stats.avgRisk}</b> ({riskBand(stats.avgRisk)}).
          {stats.atRisk > 0 && <> {stats.atRisk} sit in elevated or critical risk.</>}
        </p>

        <Card flat className="mb-5 mt-4 grid grid-cols-4">
          <div className="border-r border-line"><KPI label="Suppliers" value={rows.length} note="in category" /></div>
          <div className="border-r border-line"><KPI label="Avg risk" value={stats.avgRisk} note={riskBand(stats.avgRisk)} /></div>
          <div className="border-r border-line"><KPI label="At-risk" value={stats.atRisk} note="elevated + critical" /></div>
          <div><KPI label="Spend" value={fmtMoney(stats.spend)} note="annualised" /></div>
        </Card>

        <Card flat className="mb-5 px-5 py-4">
          <RiskBand bands={stats.bands} compact />
        </Card>

        <Card flat className="overflow-hidden">
          <Table>
            <THead>
              <Tr>
                <Th>Supplier</Th><Th>Segment</Th><Th>Country</Th><Th numeric>Scorecard</Th><Th className="w-[150px]">Risk</Th><Th className="w-[100px]">Trend</Th><Th numeric>Spend</Th><Th />
              </Tr>
            </THead>
            <TBody>
              {rows.map((s) => (
                <Tr key={s.id} onClick={() => navigate(`/app/suppliers/${s.id}`)}>
                  <Td variant="name">
                    {s.name}
                    <span className="mt-0.5 block font-mono text-[12px] font-normal text-ink-3">{s.id} · Tier {s.tier}</span>
                  </Td>
                  <Td><Pill tone={SEGMENT_PILL[s.segment]}>{s.segment}</Pill></Td>
                  <Td><Flag code={s.country} /></Td>
                  <Td variant="num">{s.scorecard}</Td>
                  <Td><RiskScore score={s.riskScore} /></Td>
                  <Td>
                    <div className="h-7 w-[90px]">
                      <Sparkline data={s.trend} color={riskColor(s.riskScore)} height={28} area={false} />
                    </div>
                  </Td>
                  <Td variant="num">{s.spend}</Td>
                  <Td className="w-8 text-right text-ink-4">›</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>

        <div className="mt-4">
          <button onClick={() => navigate('/app/categories')} className="inline-flex items-center gap-1.5 font-mono text-[13px] text-accent hover:underline">
            <Icon name="back" size={13} /> Back to categories
          </button>
        </div>
      </div>
    </AppShell>
  )
}
