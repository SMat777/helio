import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Pill } from '../ui/Pill'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Flag } from '../ui/Flag'
import { Tabs, type Tab } from '../ui/Tabs'
import { RiskScore } from '../ui/RiskScore'
import { Sparkline } from '../ui/Sparkline'
import { AreaChart } from '../ui/AreaChart'
import { SectionHead } from '../ui/SectionHead'
import { Table, THead, TBody, Tr, Th, Td } from '../ui/Table'
import { ActivityFeed } from '../ui/ActivityFeed'
import { riskBand, riskColor } from '../lib/risk'
import { toCsv, downloadCsv } from '../lib/csv'
import { fmtMoney } from '../lib/format'
import {
  getContracts,
  getContacts,
  getDocuments,
  getNcrsForSupplier,
  getActivityForSupplier,
  type Supplier,
  type Contract,
  type NcrRow,
} from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'

// Export a single supplier's headline fields as a one-row CSV.
function exportSupplier(s: Supplier) {
  const headers = ['ID', 'Name', 'Country', 'Category', 'Segment', 'Tier', 'Scorecard', 'Risk', 'OnTime%', 'Quality', 'OpenNCRs', 'SpendEUR']
  const row = [s.id, s.name, s.country, s.category, s.segment, s.tier, s.scorecard, s.riskScore, s.onTimePct, s.qualityPct, s.ncrs, s.spendEur]
  downloadCsv(`helio-${s.id}.csv`, toCsv(headers, [row]))
}

function fmtSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}

const contractTone: Record<Contract['status'], 'good' | 'warn' | 'bad' | 'muted'> = {
  active: 'good',
  expiring: 'warn',
  expired: 'bad',
  draft: 'muted',
}

const ncrSeverityTone: Record<NcrRow['severity'], 'bad' | 'warn' | 'muted'> = {
  critical: 'bad',
  major: 'warn',
  minor: 'muted',
}

const ncrStatusTone: Record<NcrRow['status'], 'bad' | 'warn' | 'muted' | 'good'> = {
  '8d': 'bad',
  open: 'warn',
  draft: 'muted',
  closed: 'good',
}

type Tone = 'good' | 'warn' | 'bad'

// Derive a sensible tone from a metric — local to the detail screen, not a global rule.
function qualityTone(pct: number): Tone {
  if (pct >= 92) return 'good'
  if (pct >= 85) return 'warn'
  return 'bad'
}
function onTimeTone(pct: number): Tone {
  if (pct >= 95) return 'good'
  if (pct >= 90) return 'warn'
  return 'bad'
}
function ncrTone(n: number): Tone {
  if (n === 0) return 'good'
  if (n === 1) return 'warn'
  return 'bad'
}

const toneVar: Record<Tone, string> = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' }
const toneText: Record<Tone, string> = { good: 'text-good', warn: 'text-warn', bad: 'text-bad' }

// One scorecard signal card (kilde: V5Signal) — label · big value · sparkline · tone.
function SignalCard({ label, value, note, tone, data }: {
  label: string
  value: string
  note: string
  tone: Tone
  data: number[]
}) {
  return (
    <Card flat className="flex flex-col px-5 pt-4 pb-4">
      <div className="mb-2 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
        <span>{label}</span>
        <Pill tone={tone} dot>{tone === 'good' ? 'OK' : tone === 'warn' ? 'Watch' : 'Risk'}</Pill>
      </div>
      <div className="font-serif text-[34px] leading-none tracking-[-0.02em] tabular-nums">{value}</div>
      <div className="mt-3 h-[36px] opacity-90">
        <Sparkline data={data} color={toneVar[tone]} height={36} />
      </div>
      <div className={`mt-2 font-mono text-[11px] ${toneText[tone]}`}>{note}</div>
    </Card>
  )
}

// Shown when a tab genuinely has no rows for this supplier (not "unbuilt").
function EmptyTab({ label }: { label: string }) {
  return (
    <Card flat className="grid min-h-[180px] place-items-center px-6 py-12">
      <div className="text-center">
        <div className="mb-2 inline-grid h-9 w-9 place-items-center rounded-lg border border-line bg-paper text-ink-3">
          <Icon name="check" size={16} />
        </div>
        <div className="text-[13.5px] font-medium text-ink">{label}</div>
      </div>
    </Card>
  )
}

function ContractsTab({ id }: { id: string }) {
  const rows = getContracts(id)
  if (!rows.length) return <EmptyTab label="No contracts on file" />
  return (
    <Card flat className="overflow-hidden">
      <Table>
        <THead>
          <Tr>
            <Th>Contract</Th><Th>Type</Th><Th numeric>Value</Th><Th>Period</Th><Th>Status</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.map((c) => (
            <Tr key={c.id}>
              <Td variant="name">
                {c.title}
                <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-3">{c.id}</span>
              </Td>
              <Td className="text-ink-2">{c.type}</Td>
              <Td variant="num">{fmtMoney(c.valueEur)}</Td>
              <Td variant="micro">{c.start} → {c.end}</Td>
              <Td><Pill tone={contractTone[c.status]} dot>{c.status}</Pill></Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

function NcrsTab({ id }: { id: string }) {
  const rows = getNcrsForSupplier(id)
  if (!rows.length) return <EmptyTab label="No NCRs — clean record" />
  return (
    <Card flat className="overflow-hidden">
      <Table>
        <THead>
          <Tr>
            <Th>NCR</Th><Th>Severity</Th><Th>Status</Th><Th>Opened</Th><Th>Due</Th><Th numeric>Cost</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.map((n) => (
            <Tr key={n.id}>
              <Td variant="name">
                {n.title}
                <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-3">{n.id}</span>
              </Td>
              <Td><Pill tone={ncrSeverityTone[n.severity]} dot>{n.severity}</Pill></Td>
              <Td><Pill tone={ncrStatusTone[n.status]}>{n.status}</Pill></Td>
              <Td variant="micro">{n.openedAt}</Td>
              <Td variant="micro">{n.dueAt}</Td>
              <Td variant="num">{fmtMoney(n.costImpactEur)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}

function ContactsTab({ id }: { id: string }) {
  const rows = getContacts(id)
  if (!rows.length) return <EmptyTab label="No contacts on file" />
  return (
    <div className="grid grid-cols-2 gap-3">
      {rows.map((c) => (
        <Card key={c.email} flat className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13.5px] font-medium text-ink">{c.name}</div>
            {c.primary && <Pill tone="outline">Primary</Pill>}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-ink-3">{c.role}</div>
          <div className="mt-2.5 flex items-center gap-2 text-[12.5px] text-ink-2">
            <Icon name="doc" size={13} className="text-ink-4" />{c.email}
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-ink-3">
            <Icon name="users" size={13} className="text-ink-4" />{c.phone}
          </div>
        </Card>
      ))}
    </div>
  )
}

function DocumentsTab({ id }: { id: string }) {
  const rows = getDocuments(id)
  if (!rows.length) return <EmptyTab label="No documents on file" />
  return (
    <Card flat className="overflow-hidden">
      {rows.map((d, i) => (
        <div
          key={`${d.name}-${i}`}
          className="flex items-center gap-3 border-b border-line-2 px-4 py-2.5 last:border-b-0"
        >
          <span className="grid h-8 w-8 flex-none place-items-center rounded-md border border-line bg-paper-2 text-ink-3">
            <Icon name="doc" size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-ink">{d.name}</div>
            <div className="font-mono text-[11px] text-ink-3">{d.category} · {d.date}</div>
          </div>
          <Pill tone="muted">{d.fileType}</Pill>
          <span className="w-[64px] text-right font-mono text-[11px] tabular-nums text-ink-3">{fmtSize(d.sizeKb)}</span>
        </div>
      ))}
    </Card>
  )
}

function ActivityTab({ id }: { id: string }) {
  const events = getActivityForSupplier(id)
  if (!events.length) return <EmptyTab label="No recent activity" />
  return (
    <Card flat className="px-5 py-2.5">
      <ActivityFeed
        items={events.map((e) => ({
          tone: e.tone,
          who: e.who,
          what: e.what,
          detail: e.detail,
          time: `${e.day} · ${e.time}`,
        }))}
      />
    </Card>
  )
}

function NotFound() {
  return (
    <AppShell
      slim
      crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; <Link to="/suppliers" className="text-accent no-underline">Suppliers</Link> &nbsp;/&nbsp; not found</>}
    >
      <div className="px-6 py-4">
        <Card flat className="grid min-h-[260px] place-items-center px-6 py-16">
          <div className="text-center">
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg border border-line bg-paper text-ink-3">
              <Icon name="warn" size={18} />
            </div>
            <div className="font-serif text-[22px] leading-tight tracking-[-0.015em]">Supplier not found</div>
            <div className="mt-1.5 text-[12.5px] text-ink-2">We couldn't find a supplier with that id.</div>
            <Link to="/suppliers" className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1.5 text-[12.5px] font-medium text-ink no-underline hover:bg-hover">
              <Icon name="back" /> Back to suppliers
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

// One eyebrow + value cell in the header stat strip (kilde: V5 metric tiles).
function HeaderStat({ label, value, unit, delta, tone, last }: {
  label: string
  value: string
  unit?: string
  delta?: string
  tone?: Tone
  last?: boolean
}) {
  return (
    <div className={`px-5 ${last ? '' : 'border-r border-line-2'}`}>
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">{label}</div>
      <div className="font-serif text-[26px] leading-none tracking-[-0.02em] tabular-nums">
        {value}
        {unit && <span className="ml-0.5 font-sans text-[13px] text-ink-3">{unit}</span>}
      </div>
      {delta && <div className={`mt-1.5 font-mono text-[11px] ${tone ? toneText[tone] : 'text-ink-3'}`}>{delta}</div>}
    </div>
  )
}

function OverviewTab({ s }: { s: Supplier }) {
  const qTone = qualityTone(s.qualityPct)
  const otTone = onTimeTone(s.onTimePct)
  const nTone = ncrTone(s.ncrs)
  return (
    <div className="flex flex-col gap-3">
      {/* KPI tiles */}
      <Card flat className="grid grid-cols-4">
        <div className="border-r border-line">
          <KPI label="Scorecard" value={s.scorecard} unit="/100" note="composite" />
        </div>
        <div className="border-r border-line">
          <KPI label="On-time" value={s.onTimePct} unit="%" note="90d" />
        </div>
        <div className="border-r border-line">
          <KPI label="Quality" value={s.qualityPct} unit="/100" note="90d" />
        </div>
        <div>
          <KPI label="Open NCRs" value={s.ncrs} note="active" />
        </div>
      </Card>

      {/* Risk over time */}
      <Card flat className="px-5 pt-4 pb-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="m-0 text-[13px] font-semibold tracking-[-0.005em]">
            Risk over time <span className="ml-2 font-mono text-[11px] font-normal text-ink-3">last 90 days</span>
          </h3>
          <span className="font-mono text-[11px] text-ink-3">12-point trend</span>
        </div>
        <AreaChart data={s.trend} color={riskColor(s.riskScore)} height={180} labels={['90d', '60d', '30d', 'now']} />
      </Card>

      {/* Summary line */}
      <Card flat className="px-5 py-4">
        <SectionHead>Summary</SectionHead>
        <p className="m-0 max-w-[68ch] text-[13px] leading-[1.6] text-ink-2">
          {s.name} is a <b className="font-medium text-ink">{s.segment.toLowerCase()}</b> supplier in {s.category}, currently scoring{' '}
          <b className="font-medium" style={{ color: riskColor(s.riskScore) }}>{s.riskScore}</b> on risk
          {' '}(<span style={{ color: riskColor(s.riskScore) }}>{riskBand(s.riskScore)}</span>).
          {' '}On-time delivery sits at <b className={`font-medium ${toneText[otTone]}`}>{s.onTimePct}%</b> and quality at{' '}
          <b className={`font-medium ${toneText[qTone]}`}>{s.qualityPct}/100</b>, with{' '}
          <b className={`font-medium ${toneText[nTone]}`}>{s.ncrs} open NCR{s.ncrs === 1 ? '' : 's'}</b>.
          {s.reason ? <> Latest flag: {s.reason.toLowerCase()}.</> : null}
        </p>
      </Card>
    </div>
  )
}

function ScorecardTab({ s }: { s: Supplier }) {
  // Three signals mirror V5Signal: Quality, On-time, NCRs. Sparklines reuse the
  // composite trend (only 12-point series the data layer exposes today).
  const qTone = qualityTone(s.qualityPct)
  const otTone = onTimeTone(s.onTimePct)
  const nTone = ncrTone(s.ncrs)
  return (
    <div className="flex flex-col gap-3">
      <Card flat className="px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">Composite risk · 30d</div>
            <div className="flex items-baseline gap-3.5">
              <div className="font-serif text-[72px] leading-[0.9] tabular-nums" style={{ color: riskColor(s.riskScore) }}>{s.riskScore}</div>
              {s.change && s.change !== '0' && (
                <div className="font-mono text-[13px]" style={{ color: riskColor(s.riskScore) }}>↗ {s.change} vs. 30d</div>
              )}
            </div>
            <div className="mt-2.5 max-w-[42ch] text-[13px] leading-[1.5] text-ink-2">
              Risk band <b className="font-medium" style={{ color: riskColor(s.riskScore) }}>{riskBand(s.riskScore)}</b>.
              {' '}Composite of on-time, quality and open NCRs.
            </div>
          </div>
          <div className="w-[180px] opacity-90">
            <Sparkline data={s.trend} color={riskColor(s.riskScore)} height={64} />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-3">
              <span>90d</span><span>60d</span><span>30d</span><span>now</span>
            </div>
          </div>
        </div>
      </Card>

      <SectionHead>Signals</SectionHead>
      <div className="grid grid-cols-3 gap-3">
        <SignalCard
          label="Quality"
          value={`${s.qualityPct}`}
          note={qTone === 'good' ? 'On target' : qTone === 'warn' ? 'Below target' : 'Quality decline'}
          tone={qTone}
          data={s.trend}
        />
        <SignalCard
          label="On-time"
          value={`${s.onTimePct}%`}
          note={otTone === 'good' ? 'On target' : otTone === 'warn' ? 'Slipping' : 'Late deliveries'}
          tone={otTone}
          data={s.trend}
        />
        <SignalCard
          label="NCRs"
          value={`${s.ncrs}`}
          note={nTone === 'good' ? 'None open' : `${s.ncrs} open · needs review`}
          tone={nTone}
          data={s.trend}
        />
      </div>
    </div>
  )
}

export default function SupplierDetail() {
  const { id = '' } = useParams()
  // Source the supplier from the same query as the list, so a Postgres-backed
  // supplier (incl. one just added) resolves here too — not only mock-seeded ids.
  const { data: all = [], isLoading } = useSuppliersQuery()
  const supplier = all.find((x) => x.id === id)
  const [active, setActive] = useState('overview')

  if (isLoading && !supplier) {
    return (
      <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; <Link to="/suppliers" className="text-accent no-underline">Suppliers</Link></>}>
        <div className="grid place-items-center py-32 font-mono text-[12.5px] text-ink-3">Loading supplier…</div>
      </AppShell>
    )
  }
  if (!supplier) return <NotFound />
  const s = supplier

  const band = riskBand(s.riskScore)
  const qTone = qualityTone(s.qualityPct)
  const otTone = onTimeTone(s.onTimePct)

  // Tabs carry live counts so the bar reflects what each panel holds.
  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'contracts', label: 'Contracts', count: getContracts(s.id).length },
    { id: 'ncrs', label: 'NCRs', count: getNcrsForSupplier(s.id).length },
    { id: 'contacts', label: 'Contacts', count: getContacts(s.id).length },
    { id: 'documents', label: 'Documents', count: getDocuments(s.id).length },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <AppShell
      slim
      crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; <Link to="/suppliers" className="text-accent no-underline">Suppliers</Link> &nbsp;/&nbsp; {s.id}</>}
      actions={
        <>
          <Button onClick={() => exportSupplier(s)}><Icon name="export" /> Export</Button>
          <Link to="/ncr/new" className="no-underline">
            <Button variant="primary">Open NCR</Button>
          </Link>
        </>
      }
    >
      <div className="px-6 py-4">
        {/* Back link */}
        <Link to="/suppliers" className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-3 no-underline hover:text-ink">
          <Icon name="back" size={13} /> Back to suppliers
        </Link>

        {/* Header block */}
        <Card flat className="mb-3 px-5 pt-5 pb-4">
          <div className="flex items-start gap-[18px]">
            <div className="grid h-[54px] w-[54px] flex-none place-items-center rounded-[10px] border border-line bg-paper-2 font-serif text-[26px] text-ink-2">
              {s.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 font-mono text-[11px] tracking-[0.04em] text-ink-3">
                <Flag code={s.country} />{s.id} · {s.category}
              </div>
              <h1 className="m-0 font-serif text-[28px] leading-none tracking-[-0.02em]">{s.name}</h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Pill tone="outline">{s.segment}</Pill>
                <Pill tone="outline">Tier {s.tier}</Pill>
                {s.ncrs > 0 && <Pill tone={s.ncrs > 1 ? 'bad' : 'warn'} dot>{s.ncrs} open NCR{s.ncrs === 1 ? '' : 's'}</Pill>}
                <Pill tone={band === 'Critical' ? 'bad' : band === 'Elevated' ? 'warn' : band === 'Watch' ? 'muted' : 'good'} dot>{band}</Pill>
              </div>
            </div>
            {/* Risk score block */}
            <div className="w-[200px] flex-none">
              <div className="mb-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">Risk score</div>
              <RiskScore score={s.riskScore} />
              <div className="mt-1.5 text-right text-[12px] font-medium" style={{ color: riskColor(s.riskScore) }}>{band}</div>
            </div>
          </div>

          {/* Header stat strip */}
          <div className="mt-4 grid grid-cols-4 border-t border-line pt-4">
            <HeaderStat label="Scorecard" value={String(s.scorecard)} unit="/100" />
            <HeaderStat label="On-time" value={`${s.onTimePct}%`} delta={`${s.onTimePct >= 95 ? 'on target' : 'below target'}`} tone={otTone} />
            <HeaderStat label="Quality" value={String(s.qualityPct)} unit="/100" delta={`${s.qualityPct >= 92 ? 'on target' : 'below target'}`} tone={qTone} />
            <HeaderStat label="Spend YTD" value={s.spend} last />
          </div>
        </Card>

        {/* Tabs */}
        <Tabs tabs={tabs} active={active} onChange={setActive} className="mb-3" />

        {/* Tab panels */}
        {active === 'overview' && <OverviewTab s={s} />}
        {active === 'scorecard' && <ScorecardTab s={s} />}
        {active === 'contracts' && <ContractsTab id={s.id} />}
        {active === 'ncrs' && <NcrsTab id={s.id} />}
        {active === 'contacts' && <ContactsTab id={s.id} />}
        {active === 'documents' && <DocumentsTab id={s.id} />}
        {active === 'activity' && <ActivityTab id={s.id} />}
      </div>
    </AppShell>
  )
}
