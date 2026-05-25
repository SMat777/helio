import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Pill } from '../ui/Pill'
import { SectionHead } from '../ui/SectionHead'
import { PageHead } from '../ui/PageHead'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { getContracts, getSupplier, type Contract } from '../lib/data'
import { fmtMoney } from '../lib/format'

const statusTone: Record<Contract['status'], 'good' | 'warn' | 'bad' | 'muted'> = {
  active: 'good',
  expiring: 'warn',
  expired: 'bad',
  draft: 'muted',
}

export default function Contracts() {
  const { attention, totals } = useMemo(() => {
    const all = getContracts()
    const byStatus = (st: Contract['status']) => all.filter((c) => c.status === st)
    const attention = [...byStatus('expired'), ...byStatus('expiring')].sort((a, b) => a.end.localeCompare(b.end))
    return {
      attention,
      totals: {
        count: all.length,
        valueEur: all.reduce((s, c) => s + c.valueEur, 0),
        expiring: byStatus('expiring').length,
        expired: byStatus('expired').length,
      },
    }
  }, [])

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Contracts</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Portfolio · Agreements"
          title="Contracts needing a renewal call."
          lede="The whole portfolio at a glance, with expired and soon-to-expire agreements pulled to the front. Renew before a lapse turns into a single-source gap."
        />

        <Card flat className="mb-6 grid grid-cols-4">
          <div className="border-r border-line"><KPI label="Contracts" value={totals.count} note="active book" /></div>
          <div className="border-r border-line"><KPI label="Total value" value={fmtMoney(totals.valueEur)} note="committed" /></div>
          <div className="border-r border-line"><KPI label="Expiring" value={totals.expiring} note="< 60 days" /></div>
          <div><KPI label="Expired" value={totals.expired} note="lapsed" /></div>
        </Card>

        <SectionHead>Expired &amp; expiring soon</SectionHead>
        <Card flat className="overflow-hidden">
          <Table>
            <THead>
              <Tr>
                <Th>Contract</Th><Th>Supplier</Th><Th>Type</Th><Th numeric>Value</Th><Th>Ends</Th><Th>Status</Th>
              </Tr>
            </THead>
            <TBody>
              {attention.map((c) => {
                const s = getSupplier(c.supplierId)
                return (
                  <Tr key={c.id}>
                    <Td variant="name" className="p-0">
                      <Link to={`/suppliers/${c.supplierId}`} className="block px-3 py-[9px] text-ink no-underline">
                        {c.title}
                        <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-3">{c.id}</span>
                      </Link>
                    </Td>
                    <Td className="text-ink-2">{s?.name ?? c.supplierId}</Td>
                    <Td className="text-ink-2">{c.type}</Td>
                    <Td variant="num">{fmtMoney(c.valueEur)}</Td>
                    <Td variant="micro">{c.end}</Td>
                    <Td><Pill tone={statusTone[c.status]} dot>{c.status}</Pill></Td>
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
