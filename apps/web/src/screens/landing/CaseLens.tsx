import { Link } from 'react-router-dom'
import { DEMO_PATH } from './links'

// Frames the product as a consulting engagement: the recruiter reads Helio as a
// deliverable — diagnose, analyse, recommend, communicate — not just a dashboard.
const STEPS = [
  {
    no: '01',
    move: 'Diagnose',
    q: 'Where does the risk concentrate?',
    a: '247 suppliers on a Kraljic matrix, scored by one risk model. Strategic and Bottleneck carry the structural risk — each quadrant with its recommended play.',
  },
  {
    no: '02',
    move: 'Analyse',
    q: 'How deep does the dependency run?',
    a: 'A spend Pareto and single-source exposure: 80% of spend sits with a fraction of suppliers, and a handful of categories hang on one source.',
  },
  {
    no: '03',
    move: 'Recommend',
    q: 'So what do we do about it?',
    a: 'A ranked action plan — dual-source the critical few, de-risk single-source, free spend — each move carrying its risk-point and euro impact.',
  },
  {
    no: '04',
    move: 'Communicate',
    q: 'What is the one-page story?',
    a: 'An executive briefing that synthesises state, drivers and the top moves into the one read a partner would actually take to the board.',
  },
] as const

export default function CaseLens() {
  return (
    <section className="case" id="case" aria-labelledby="case-h" data-testid="landing-case">
      <header className="section-head">
        <h2 id="case-h">One portfolio, <span className="accent">read like a case.</span></h2>
        <p className="section-lead">
          The same engagement a consultant runs — diagnose, analyse, recommend, communicate — built into
          one product. Each step is a surface you can open, not a slide.
        </p>
      </header>

      <ol className="case-arc">
        {STEPS.map((s) => (
          <li key={s.no} className="case-step">
            <span className="case-no">{s.no}</span>
            <h3>{s.move}</h3>
            <p className="case-q">{s.q}</p>
            <p className="case-a">{s.a}</p>
          </li>
        ))}
      </ol>

      <Link to={DEMO_PATH} className="case-cta">Walk the case in the live demo →</Link>
    </section>
  )
}
