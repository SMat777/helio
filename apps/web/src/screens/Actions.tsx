import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { PageHead } from '../ui/PageHead'
import { getRecommendations, type ActionKind } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'
import { fmtMoney } from '../lib/format'

const KIND: Record<ActionKind, { label: string; color: string }> = {
  'dual-source': { label: 'Dual-source', color: 'var(--bad)' },
  'de-risk': { label: 'De-risk', color: 'var(--cta)' },
  renegotiate: { label: 'Renegotiate', color: 'var(--accent)' },
  consolidate: { label: 'Consolidate', color: 'var(--good)' },
  'resolve-ncr': { label: 'Quality', color: 'var(--warn)' },
}

export default function Actions() {
  const { data: suppliers = [] } = useSuppliersQuery()
  const actions = useMemo(() => getRecommendations(suppliers), [suppliers])

  const riskPts = actions.reduce((s, a) => s + a.riskDelta, 0)
  const eurTotal = actions.reduce((s, a) => s + a.eurImpact, 0)
  const thisWeek = actions.filter((a) => a.urgency === 'This week').length

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Action plan</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Workspace · Action plan"
          title="What to do next."
          lede="The portfolio, read as a set of prioritised moves — each with the risk it removes and the money it frees. Ranked by impact, not by alphabet."
        />

        <Card flat className="mb-6 grid grid-cols-3">
          <div className="border-r border-line"><KPI label="Risk addressable" value={riskPts} unit="pts" note="across all moves" /></div>
          <div className="border-r border-line"><KPI label="Impact identified" value={fmtMoney(eurTotal)} note="spend freed / exposure cut" /></div>
          <div><KPI label="Do this week" value={thisWeek} note={`of ${actions.length} moves`} /></div>
        </Card>

        <div className="flex flex-col gap-3">
          {actions.map((a) => {
            const k = KIND[a.kind]
            const body = (
              <div className="grid grid-cols-[34px_1fr_auto] items-start gap-4 px-4 py-3.5">
                <div className="grid h-[26px] w-[26px] place-content-center rounded-full bg-ink font-mono text-[12px] font-bold text-paper">{a.rank}</div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-card" style={{ background: k.color }}>{k.label}</span>
                    <h3 className="m-0 text-[15px] font-semibold tracking-[-0.005em] text-ink">{a.title}</h3>
                  </div>
                  <p className="m-0 max-w-[72ch] text-[13px] leading-[1.5] text-ink-2">{a.detail}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {a.riskDelta > 0 && <span className="font-mono text-[13px] font-bold tabular-nums text-bad">−{a.riskDelta} risk</span>}
                  {a.eurImpact > 0 && <span className="font-mono text-[13px] font-bold tabular-nums text-good">{fmtMoney(a.eurImpact)}</span>}
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">{a.effort} · {a.urgency}</span>
                </div>
              </div>
            )
            return (
              <Card key={a.id} flat className="overflow-hidden" style={{ borderLeft: `3px solid ${k.color}` }}>
                {a.supplierId
                  ? <Link to={`/app/suppliers/${a.supplierId}`} className="block text-ink no-underline transition-colors hover:bg-hover">{body}</Link>
                  : body}
              </Card>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
