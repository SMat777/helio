import { Link } from 'react-router-dom'

export default function Cta() {
  return (
    <section className="cta-block" id="cta" aria-labelledby="cta-h" data-testid="landing-cta">
      <header className="section-head">
        <h2 id="cta-h">The demo runs on 247 suppliers. <span className="accent">In-memory. No signup.</span></h2>
        <p className="section-lead">Mutations stay for the session and reset on reload — every visitor gets a clean slate.</p>
      </header>
      <div className="cta-buttons">
        <Link to="/app" className="btn-primary btn-lg">Open the live demo →</Link>
        <a
          href="https://github.com/SMat777/helio"
          className="btn-secondary btn-lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          See the code on GitHub <span className="sr-only">(opens in new tab)</span>
        </a>
      </div>
    </section>
  )
}
