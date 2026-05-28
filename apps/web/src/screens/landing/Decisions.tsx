const DECISIONS = [
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

      <ul className="dec-grid">
        {DECISIONS.map((d) => (
          <li className="dec-row" key={d.title}>
            <div className="dec-title">{d.title}</div>
            <div className="dec-why">{d.why}</div>
          </li>
        ))}
      </ul>

      <p className="dec-fineprint">
        <em>What's intentionally not here:</em> no multi-tenant auth, no realtime subscriptions, sub-entities deterministically seeded per supplier ID. Known migration frontier, not an accident.
      </p>
    </section>
  )
}
