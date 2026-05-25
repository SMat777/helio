import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI, type KPIDir } from '../ui/KPI'
import { RiskBand } from '../ui/RiskBand'
import { ActivityFeed, type FeedItem } from '../ui/ActivityFeed'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { riskColor } from '../lib/risk'
import { getKpis, getRiskSummary, getNeedsAttention, getActivity, type Supplier } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'

// Dashboard-local: a "needs attention" story card (kilde: DV3StoryCard).
function StoryCard({ s }: { s: Supplier }) {
  const color = riskColor(s.riskScore)
  return (
    <Link
      to={`/suppliers/${s.id}`}
      className="flex min-h-[60px] flex-col justify-center rounded-lg border border-line bg-paper px-3.5 py-3 no-underline"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <div className="text-[13.5px] font-medium text-ink">{s.name}</div>
        <div className="font-mono text-[11px] tabular-nums text-ink-3">{s.id} · {s.spend}</div>
      </div>
      <div className="text-[12.5px] leading-[1.45] text-ink-2">
        Risk score <b className="tabular-nums" style={{ color }}>{s.riskScore}</b>
        {s.change && s.change !== '0' && <span className="text-ink-3"> ({s.change} vs. 30d)</span>}
        {s.reason ? ` — ${s.reason.toLowerCase()}.` : '.'}
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { data: suppliers = [] } = useSuppliersQuery()
  const kpis = getKpis(suppliers)
  const summary = getRiskSummary(suppliers)
  const needs = getNeedsAttention(suppliers, 5)
  const activity = getActivity(6)

  const critical = summary.bands.find((b) => b.label === 'Critical')?.n ?? 0
  const elevated = summary.bands.find((b) => b.label === 'Elevated')?.n ?? 0

  const feed: FeedItem[] = activity.map((a) => ({
    tone: a.tone,
    who: a.who,
    what: <span style={{ color: `var(--${a.tone})` }}>{a.what}</span>,
    detail: a.detail,
    time: a.day === 'Yesterday' ? 'yesterday' : a.time,
  }))

  return (
    <AppShell
      slim
      crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Dashboard &nbsp;·&nbsp; <span className="text-ink-3">May 23</span></>}
      actions={
        <>
          <Button>30d</Button>
          <Button>All categories</Button>
          <Button variant="primary"><Icon name="plus" /> Add</Button>
        </>
      }
    >
      <div className="px-6 py-4">
        {/* KPI row */}
        <Card flat className="mb-3 grid grid-cols-4">
          {kpis.map((k, i) => (
            <div key={k.label} className={i < 3 ? 'border-r border-line' : ''}>
              <KPI label={k.label} value={k.value} unit={k.unit} delta={k.delta} dir={k.dir as KPIDir} note={k.note} />
            </div>
          ))}
        </Card>

        {/* Distribution + intro */}
        <Card flat className="mb-3 grid grid-cols-[1fr_1.4fr] items-center gap-7 px-5 py-4">
          <div>
            <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">Today</div>
            <div className="font-serif text-[24px] leading-[1.1] tracking-[-0.015em]">
              {critical} critical · {elevated} elevated
            </div>
            <div className="mt-1.5 text-[12px] text-ink-3">Across {summary.total} active suppliers.</div>
          </div>
          <RiskBand bands={summary.bands} compact />
        </Card>

        {/* Needs attention + activity */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-3">
          <Card flat className="px-4 py-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="m-0 text-[13px] font-semibold tracking-[-0.005em]">
                Needs attention <span className="ml-2 font-mono text-[11px] font-normal text-ink-3">5 of 18</span>
              </h3>
              <Link to="/suppliers" className="font-mono text-[11px] text-accent no-underline">view all →</Link>
            </div>
            <div className="grid auto-rows-fr grid-cols-2 gap-2">
              {needs.map((s) => <StoryCard key={s.id} s={s} />)}
            </div>
          </Card>

          <Card flat className="px-4 pt-4 pb-2.5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="m-0 text-[13px] font-semibold tracking-[-0.005em]">Activity</h3>
              <span className="font-mono text-[11px] text-ink-3">last 24h</span>
            </div>
            <ActivityFeed items={feed} />
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
