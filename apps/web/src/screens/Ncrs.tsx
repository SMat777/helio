import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Pill } from '../ui/Pill'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { PageHead } from '../ui/PageHead'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { getNcrs, getSupplier, type NcrRow } from '../lib/data'
import { fmtMoney } from '../lib/format'

const severityTone: Record<NcrRow['severity'], 'bad' | 'warn' | 'muted'> = {
  critical: 'bad',
  major: 'warn',
  minor: 'muted',
}
const statusTone: Record<NcrRow['status'], 'bad' | 'warn' | 'muted' | 'good'> = {
  '8d': 'bad',
  open: 'warn',
  draft: 'muted',
  closed: 'good',
}
const sevRank: Record<NcrRow['severity'], number> = { critical: 0, major: 1, minor: 2 }

export default function Ncrs() {
  const { open, closedCount, critical, dueSoon } = useMemo(() => {
    const all = getNcrs()
    const open = all
      .filter((n) => n.status !== 'closed')
      .sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || a.dueAt.localeCompare(b.dueAt))
    return {
      open,
      closedCount: all.length - open.length,
      critical: open.filter((n) => n.severity === 'critical').length,
      dueSoon: open.filter((n) => n.dueAt <= '2024-06-01').length,
    }
  }, [])

  return (
    <AppShell
      slim
      crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; NCRs</>}
      actions={
        <Link to="/ncr/new" className="no-underline">
          <Button variant="primary"><Icon name="plus" /> New NCR</Button>
        </Link>
      }
    >
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Quality · Non-conformance"
          title="Open non-conformance reports."
          lede="Every open deviation across the portfolio, highest severity first. Resolve with an 8D before the due date to keep critical suppliers in check."
        />

        <Card flat className="mb-5 grid grid-cols-4">
          <div className="border-r border-line"><KPI label="Open" value={open.length} note="active" /></div>
          <div className="border-r border-line"><KPI label="Critical" value={critical} note="needs 8D" /></div>
          <div className="border-r border-line"><KPI label="Due by Jun 1" value={dueSoon} note="this window" /></div>
          <div><KPI label="Resolved" value={closedCount} note="historical" /></div>
        </Card>

        <Card flat className="overflow-hidden">
          <Table>
            <THead>
              <Tr>
                <Th>NCR</Th><Th>Supplier</Th><Th>Severity</Th><Th>Status</Th><Th>Opened</Th><Th>Due</Th><Th numeric>Cost</Th>
              </Tr>
            </THead>
            <TBody>
              {open.map((n) => {
                const s = getSupplier(n.supplierId)
                return (
                  <Tr key={n.id}>
                    <Td variant="name" className="p-0">
                      <Link to={`/suppliers/${n.supplierId}`} className="block px-3 py-3 no-underline">
                        <span className="text-[15.5px] font-semibold leading-tight text-ink">{n.title}</span>
                        <span className="mt-1 block font-mono text-[12px] font-normal text-ink-3">{n.id}</span>
                      </Link>
                    </Td>
                    <Td className="text-[14px] text-ink-2">{s?.name ?? n.supplierId}</Td>
                    <Td><Pill tone={severityTone[n.severity]} dot>{n.severity}</Pill></Td>
                    <Td><Pill tone={statusTone[n.status]}>{n.status}</Pill></Td>
                    <Td variant="micro">{n.openedAt}</Td>
                    <Td variant="micro">{n.dueAt}</Td>
                    <Td variant="num">{fmtMoney(n.costImpactEur)}</Td>
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
