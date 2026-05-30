import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { getRiskSummary, getConcentration, getRecommendations, getNeedsAttention } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'
import { fmtMoney } from '../lib/format'

const eurM = (eur: number) => `€${(eur / 1e6).toFixed(1)}M`

function Figure({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-l-2 border-line pl-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.07em] text-ink-3">{label}</div>
      <div className="mt-0.5 font-serif text-[24px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[11.5px] text-ink-3">{sub}</div>}
    </div>
  )
}

export default function Briefing() {
  const { data: suppliers = [] } = useSuppliersQuery()
  const summary = useMemo(() => getRiskSummary(suppliers), [suppliers])
  const con = useMemo(() => getConcentration(suppliers), [suppliers])
  const recs = useMemo(() => getRecommendations(suppliers), [suppliers])
  const needs = useMemo(() => getNeedsAttention(suppliers, 3), [suppliers])

  const critical = summary.bands.find((b) => b.label === 'Critical')?.n ?? 0
  const elevated = summary.bands.find((b) => b.label === 'Elevated')?.n ?? 0
  const criticalRisk = recs.filter((r) => r.kind === 'dual-source').reduce((s, r) => s + r.riskDelta, 0)
  const top3 = recs.slice(0, 3)

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Briefing</>}>
      <div className="mx-auto max-w-[760px] px-6 py-8">
        <div className="mb-1 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
          <span>Executive briefing</span>
          <span>247 suppliers · May 23</span>
        </div>
        <h1 className="m-0 font-serif text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
          The portfolio in one read.
        </h1>

        {/* Situation */}
        <p className="mt-5 text-[16px] leading-[1.65] text-ink">
          Across <b className="font-semibold">247 suppliers</b>, <b className="font-semibold text-bad">{critical} sit in critical
          risk</b> and {elevated} in elevated — <b className="font-semibold">{summary.atRisk} need active management</b>.
          Annual spend runs <b className="font-semibold">{fmtMoney(con.totalEur)}</b>; {con.top10Pct.toFixed(0)}% of it
          concentrates in the top ten suppliers, and <b className="font-semibold">{eurM(con.singleSourceEur)} hangs on
          single-source categories</b> — the dependencies a disruption hits hardest.
        </p>

        {/* Key figures */}
        <div className="mt-7 grid grid-cols-4 gap-4 border-y border-line py-5">
          <Figure label="Critical" value={String(critical)} sub="risk ≥ 75" />
          <Figure label="At risk" value={String(summary.atRisk)} sub="elevated + critical" />
          <Figure label="Single-source" value={eurM(con.singleSourceEur)} sub={`${con.singleSourceCount} categories`} />
          <Figure label="80% of spend" value={String(con.pareto80N)} sub="suppliers" />
        </div>

        {/* What's moving */}
        <h2 className="mt-8 mb-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-2">What is moving</h2>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {needs.map((s) => (
            <li key={s.id} className="flex items-baseline gap-3 text-[14px] leading-[1.5]">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-bad" aria-hidden="true" />
              <span className="text-ink">
                <Link to={`/app/suppliers/${s.id}`} className="font-semibold text-ink no-underline hover:underline">{s.name}</Link>
                {s.change && s.change !== '0' && <span className="text-ink-3"> · risk {s.change} vs 30d</span>}
                {s.reason && <span className="text-ink-2"> — {s.reason.toLowerCase()}</span>}
              </span>
            </li>
          ))}
        </ul>

        {/* Recommended this week */}
        <h2 className="mt-8 mb-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-2">Recommended now</h2>
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {top3.map((a) => (
            <li key={a.id} className="grid grid-cols-[22px_1fr_auto] items-baseline gap-3 text-[14px] leading-[1.5]">
              <span className="grid h-[22px] w-[22px] place-content-center rounded-full bg-ink font-mono text-[11px] font-bold text-paper">{a.rank}</span>
              <span className="text-ink">{a.title}</span>
              <span className="font-mono text-[12.5px] font-bold tabular-nums">
                {a.riskDelta > 0 && <span className="text-bad">−{a.riskDelta} risk</span>}
                {a.riskDelta > 0 && a.eurImpact > 0 && <span className="text-ink-3"> · </span>}
                {a.eurImpact > 0 && <span className="text-good">{fmtMoney(a.eurImpact)}</span>}
              </span>
            </li>
          ))}
        </ol>

        {/* Bottom line */}
        <div className="mt-8 rounded-lg bg-paper-2 px-5 py-4" style={{ borderLeft: '3px solid var(--cta)' }}>
          <div className="mb-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-cta">Bottom line</div>
          <p className="m-0 text-[14.5px] leading-[1.6] text-ink">
            Fastest risk reduction is dual-sourcing the {critical} critical suppliers — <b className="font-semibold">−{criticalRisk} risk-points</b> this
            week. The largest structural exposure is <b className="font-semibold">{eurM(con.singleSourceEur)}</b> across {con.singleSourceCount} single-source
            categories. <Link to="/app/actions" className="font-semibold text-cta no-underline hover:underline">See the full action plan →</Link>
          </p>
        </div>
      </div>
    </AppShell>
  )
}
