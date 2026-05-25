import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Pill, type PillTone } from '../ui/Pill'
import { SectionHead } from '../ui/SectionHead'
import { PageHead } from '../ui/PageHead'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { getSuppliers, type Supplier, type Segment } from '../lib/data'

const SEGMENT_PILL: Record<Segment, PillTone> = {
  Strategic: 'outline',
  Bottleneck: 'bad',
  Leverage: 'good',
  Routine: 'muted',
}

function scoreColor(n: number): string {
  if (n >= 85) return 'var(--good)'
  if (n >= 70) return 'var(--warn)'
  return 'var(--bad)'
}

function ScoreTable({ rows }: { rows: Supplier[] }) {
  return (
    <Card flat className="overflow-hidden">
      <Table>
        <THead>
          <Tr>
            <Th>Supplier</Th><Th>Segment</Th><Th numeric>Scorecard</Th><Th numeric>On-time</Th><Th numeric>Quality</Th><Th numeric>NCRs</Th>
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
              <Td><Pill tone={SEGMENT_PILL[s.segment]}>{s.segment}</Pill></Td>
              <Td variant="num">
                <span className="font-serif text-[17px] font-semibold" style={{ color: scoreColor(s.scorecard) }}>{s.scorecard}</span>
                <span className="text-ink-3">/100</span>
              </Td>
              <Td variant="num">{s.onTimePct}%</Td>
              <Td variant="num">{s.qualityPct}</Td>
              <Td variant="num">{s.ncrs > 0 ? <span className="font-medium text-bad">{s.ncrs}</span> : <span className="text-ink-4">—</span>}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

export default function Scorecards() {
  const { top, bottom, avg, tier1, onTarget } = useMemo(() => {
    const all = [...getSuppliers()].sort((a, b) => b.scorecard - a.scorecard)
    const avg = Math.round(all.reduce((s, x) => s + x.scorecard, 0) / all.length)
    return {
      top: all.slice(0, 10),
      bottom: all.slice(-10).reverse(),
      avg,
      tier1: all.filter((s) => s.tier === 1).length,
      onTarget: all.filter((s) => s.scorecard >= 85).length,
    }
  }, [])

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Scorecards</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Reports · Supplier scoring"
          title="Who's carrying their weight."
          lede="Composite scorecards blend on-time delivery, quality and open NCRs. The leaders earn lighter oversight; the laggards need a conversation."
        />

        <Card flat className="mb-6 grid grid-cols-3">
          <div className="border-r border-line"><KPI label="Avg scorecard" value={avg} unit="/100" note="portfolio" /></div>
          <div className="border-r border-line"><KPI label="Tier 1" value={tier1} note="suppliers" /></div>
          <div><KPI label="On target" value={onTarget} note="scorecard ≥ 85" /></div>
        </Card>

        <SectionHead>Top performers</SectionHead>
        <div className="mb-6"><ScoreTable rows={top} /></div>

        <SectionHead>Needs improvement</SectionHead>
        <ScoreTable rows={bottom} />
      </div>
    </AppShell>
  )
}
