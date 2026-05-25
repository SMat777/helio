import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { SectionHead } from '../ui/SectionHead'
import { PageHead } from '../ui/PageHead'
import { HBarRow, HBarGroup } from '../ui/HBarRow'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { getSpendBreakdown, type SpendByKey } from '../lib/data'
import { fmtMoney } from '../lib/format'

// Normalise bar widths to the largest item so the group fills the track.
function bars(items: SpendByKey[], max: number) {
  return items.map((it) => ({ ...it, w: max ? Math.round((it.eur / max) * 100) : 0 }))
}

export default function Spend() {
  const data = useMemo(() => getSpendBreakdown(), [])
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
                    <Link to={`/suppliers/${s.id}`} className="block px-3 py-[9px] text-ink no-underline">
                      {s.name}
                      <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-3">{s.id}</span>
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
