import { GITHUB_PROFILE_URL, LINKEDIN_URL } from './links'

export default function Byline() {
  return (
    <footer className="byline" id="byline" aria-labelledby="byline-h" data-testid="landing-byline">
      <h3 id="byline-h">About this build</h3>
      <p>
        Built by <strong>Simon Mathiasen</strong>, Datamatiker student at EAAA Aarhus. Helio is a learning flagship — a mock-first vertical slice in React 19 + Vite + TypeScript, with Supabase + Postgres slotting in behind the same async signatures.
      </p>
      <div className="byline-links">
        <a href={GITHUB_PROFILE_URL} className="byline-link" target="_blank" rel="noopener noreferrer">
          GitHub <span className="sr-only">(opens in new tab)</span>
        </a>
        <a href={LINKEDIN_URL} className="byline-link" target="_blank" rel="noopener noreferrer">
          LinkedIn <span className="sr-only">(opens in new tab)</span>
        </a>
      </div>
    </footer>
  )
}
