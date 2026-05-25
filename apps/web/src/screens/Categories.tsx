import { useMemo } from 'react'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { PageHead } from '../ui/PageHead'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { riskColor } from '../lib/risk'
import { getCategoryRisk, getSpendBreakdown } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'
import { fmtMoney } from '../lib/format'

export default function Categories() {
  const { data: suppliers = [] } = useSuppliersQuery()
  const rows = useMemo(() => {
    const spend = new Map(getSpendBreakdown(suppliers).byCategory.map((c) => [c.key, c]))
    return getCategoryRisk(suppliers, 20)
      .map((r) => ({
        ...r,
        spendEur: spend.get(r.category)?.eur ?? 0,
        share: spend.get(r.category)?.pct ?? 0,
      }))
      .sort((a, b) => b.avgRisk - a.avgRisk)
  }, [suppliers])

  const totalSpend = useMemo(() => suppliers.reduce((s, x) => s + x.spendEur, 0), [suppliers])
  const supplierCount = suppliers.length

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Categories</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Portfolio · Spend categories"
          title="Where risk lives by category."
          lede="Each spend category, ranked by average supplier risk. The categories at the top concentrate the most exposure — start category reviews there."
        />

        <Card flat className="mb-5 grid grid-cols-3">
          <div className="border-r border-line"><KPI label="Categories" value={rows.length} note="tracked" /></div>
          <div className="border-r border-line"><KPI label="Suppliers" value={supplierCount} note="across all" /></div>
          <div><KPI label="Total spend" value={fmtMoney(totalSpend)} note="annualised" /></div>
        </Card>

        <Card flat className="overflow-hidden">
          <Table>
            <THead>
              <Tr>
                <Th>Category</Th><Th numeric>Suppliers</Th><Th className="w-[220px]">Avg risk</Th><Th numeric>Spend</Th><Th numeric>Share</Th>
              </Tr>
            </THead>
            <TBody>
              {rows.map((r) => {
                const color = riskColor(r.avgRisk)
                return (
                  <Tr key={r.category}>
                    <Td variant="name">{r.category}</Td>
                    <Td variant="num">{r.count}</Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-rail">
                          <span className="block h-full rounded-full" style={{ width: `${r.avgRisk}%`, background: color }} />
                        </span>
                        <span className="w-[24px] text-right font-mono text-[12px] font-semibold tabular-nums" style={{ color }}>{r.avgRisk}</span>
                      </div>
                    </Td>
                    <Td variant="num">{fmtMoney(r.spendEur)}</Td>
                    <Td variant="num">{r.share}%</Td>
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
