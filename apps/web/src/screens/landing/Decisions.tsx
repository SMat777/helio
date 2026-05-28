import type { ReactNode } from 'react'

interface Decision {
  title: string
  why: ReactNode
}

const DECISIONS: Decision[] = [
  {
    title: 'Mock-first, swap later',
    why: <>Ship a vertical slice in days. The repo (<code>lib/data/suppliersRepo.ts</code>) is the swap line — screens never know which backing store they're hitting.</>,
  },
  {
    title: 'One risk module',
    why: <>Bands and colors defined once in <code>lib/risk.ts</code>. No drift between table cells, badges, chart thresholds, or matrix tiles.</>,
  },
  {
    title: 'Pure derivations',
    why: <>KPIs, matrix counts, sparkline series are <code>(suppliers: Supplier[]) =&gt; Result</code>. Predictable, testable, replayable.</>,
  },
  {
    title: 'Semantic CSS tokens',
    why: <>Primitives reference tokens, not hex. <code>--cta</code> (terracotta), <code>--accent</code> (navy), <code>--font-serif</code> (Outfit).</>,
  },
  {
    title: 'Lazy backend',
    why: <><code>@supabase/supabase-js</code> dynamically imported. Mock builds stay smaller; the live demo runs in-memory.</>,
  },
]

export default function Decisions() {
  return (
    <section className="decisions" id="decisions" aria-labelledby="decisions-h" data-testid="landing-decisions">
      <header className="section-head">
        <h2 id="decisions-h">Five decisions. <span className="accent-blue">No accidents.</span></h2>
        <p className="section-lead">The architecture choices that make Helio behave coherently across 13 routes.</p>
      </header>

      <dl className="dec-grid">
        {DECISIONS.map((d) => (
          <div className="dec-row" key={d.title}>
            <dt className="dec-title">{d.title}</dt>
            <dd className="dec-why">{d.why}</dd>
          </div>
        ))}
      </dl>

      <p className="dec-fineprint">
        <em>What's intentionally not here:</em> no multi-tenant auth, no realtime subscriptions, sub-entities deterministically seeded per supplier ID. Known migration frontier, not an accident.
      </p>
    </section>
  )
}
