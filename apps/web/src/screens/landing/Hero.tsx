import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-h1" data-testid="landing-hero">
      <nav className="hero-nav" aria-label="Primary">
        <Link to="/" className="hero-logo">Helio</Link>
        <div className="hero-anchors">
          <a href="#lenses">Three lenses</a>
          <a href="#risk">Risk engine</a>
          <a href="#decisions">Decisions</a>
        </div>
        <Link to="/app" className="hero-nav-cta" aria-label="Open the live demo">Open demo →</Link>
      </nav>

      <h1 id="hero-h1" className="hero-h1">
        Three lenses. <span className="accent">One portfolio.</span> One risk model.
      </h1>

      <p className="hero-sub">
        Helio shows 247 suppliers as a Kraljic matrix, a sortable table, or visual cards. One risk model behind all three, so changing a threshold reflows everything.
      </p>

      <div className="hero-cta">
        <Link to="/app" className="btn-primary">Open the live demo →</Link>
        <a
          href="https://github.com/SMat777/helio"
          className="btn-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          See the code <span className="sr-only">(opens in new tab)</span>
        </a>
      </div>

      <p className="hero-trust">
        <span>29 of 29 tests</span>
        <span className="dot" aria-hidden="true">●</span>
        <span>247-supplier seed</span>
        <span className="dot" aria-hidden="true">●</span>
        <span>mock-first, supabase-ready</span>
      </p>

      <figure className="hero-peek">
        <img
          src="/screenshots/matrix-tight.png"
          alt="Kraljic matrix preview showing 247 suppliers across Strategic, Bottleneck, Leverage, and Routine quadrants"
        />
      </figure>
    </section>
  )
}
