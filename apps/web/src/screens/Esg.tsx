import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Pill } from '../ui/Pill'
import { SectionHead } from '../ui/SectionHead'
import { PageHead } from '../ui/PageHead'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { getEsg, getSupplier, type EsgRating } from '../lib/data'

const ratingTone: Record<EsgRating, 'good' | 'muted' | 'warn' | 'bad'> = {
  A: 'good',
  B: 'muted',
  C: 'warn',
  D: 'bad',
}
const RATINGS: EsgRating[] = ['A', 'B', 'C', 'D']

function Pillar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'var(--good)' : value >= 55 ? 'var(--warn)' : 'var(--bad)'
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase text-ink-3">{label}</span>
      <span className="font-mono text-[12px] font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}

export default function Esg() {
  const { flagged, avg, aCount, scope2, dist } = useMemo(() => {
    const all = getEsg()
    const avg = Math.round(all.reduce((s, x) => s + x.overall, 0) / all.length)
    const dist = RATINGS.map((r) => ({ rating: r, n: all.filter((x) => x.rating === r).length }))
    const flagged = all
      .filter((x) => x.rating === 'C' || x.rating === 'D')
      .sort((a, b) => a.overall - b.overall)
      .slice(0, 12)
    return {
      flagged,
      avg,
      aCount: all.filter((x) => x.rating === 'A').length,
      scope2: all.filter((x) => x.scope2Verified).length,
      dist,
    }
  }, [])

  const distMax = Math.max(...dist.map((d) => d.n), 1)

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; ESG</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Reports · Environmental · Social · Governance"
          title="Sustainability standing."
          lede="Each supplier scored across environmental, social and governance pillars. C and D ratings are pulled forward — they're the audit and remediation backlog."
        />

        <Card flat className="mb-6 grid grid-cols-4">
          <div className="border-r border-line"><KPI label="Avg ESG" value={avg} unit="/100" note="portfolio" /></div>
          <div className="border-r border-line"><KPI label="A-rated" value={aCount} note="leaders" /></div>
          <div className="border-r border-line"><KPI label="Scope 2 verified" value={scope2} note="suppliers" /></div>
          <div><KPI label="Flagged" value={flagged.length} note="C/D shown" /></div>
        </Card>

        <div className="mb-6 grid grid-cols-[300px_1fr] gap-4">
          <Card flat className="px-5 pt-4 pb-5">
            <SectionHead>Rating mix</SectionHead>
            <div className="flex flex-col gap-2.5">
              {dist.map((d) => (
                <div key={d.rating} className="grid grid-cols-[20px_1fr_40px] items-center gap-2.5">
                  <Pill tone={ratingTone[d.rating]}>{d.rating}</Pill>
                  <span className="h-2 overflow-hidden rounded-full bg-rail">
                    <span className="block h-full rounded-full" style={{ width: `${(d.n / distMax) * 100}%`, background: `var(--${ratingTone[d.rating] === 'muted' ? 'ink-4' : ratingTone[d.rating]})` }} />
                  </span>
                  <span className="text-right font-mono text-[12px] tabular-nums text-ink">{d.n}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card flat className="grid place-items-center px-5">
            <p className="max-w-[52ch] text-center text-[13.5px] leading-[1.6] text-ink-2">
              A and B ratings cover the bulk of the book. The work sits in the <b className="font-medium text-ink">C and D tail</b> — schedule audits and request remediation plans before the next ESG report cycle.
            </p>
          </Card>
        </div>

        <SectionHead>Flagged for review</SectionHead>
        <Card flat className="overflow-hidden">
          <Table>
            <THead>
              <Tr><Th>Supplier</Th><Th>Rating</Th><Th numeric>Overall</Th><Th>Pillars</Th><Th>Scope 2</Th></Tr>
            </THead>
            <TBody>
              {flagged.map((x) => {
                const s = getSupplier(x.supplierId)
                return (
                  <Tr key={x.supplierId}>
                    <Td variant="name" className="p-0">
                      <Link to={`/suppliers/${x.supplierId}`} className="block px-3 py-[9px] text-ink no-underline">
                        {s?.name ?? x.supplierId}
                        <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-3">{x.supplierId}</span>
                      </Link>
                    </Td>
                    <Td><Pill tone={ratingTone[x.rating]} dot>{x.rating}</Pill></Td>
                    <Td variant="num">{x.overall}</Td>
                    <Td>
                      <div className="flex gap-4">
                        <Pillar label="E" value={x.e} />
                        <Pillar label="S" value={x.s} />
                        <Pillar label="G" value={x.g} />
                      </div>
                    </Td>
                    <Td>{x.scope2Verified ? <Pill tone="good" dot>verified</Pill> : <Pill tone="muted">pending</Pill>}</Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  )
}
