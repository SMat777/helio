export default function Problem() {
  return (
    <section className="problem" id="problem" aria-labelledby="problem-h" data-testid="landing-problem">
      <header className="section-head">
        <h2 id="problem-h">The procurement problem</h2>
        <p className="section-lead">Where most supplier data still lives.</p>
      </header>

      <div className="pillars">
        <div className="pillar">
          <h3>Spreadsheet sprawl</h3>
          <p>Risk lives in one file, ESG in another, contracts in a third. Different views = different sources. The view <em>is</em> the data integrity problem.</p>
        </div>
        <div className="pillar">
          <h3>Risk hides in single numbers</h3>
          <p>A "risk score" without bands, drivers, or trends is just a number. Helio surfaces all three — and they update from one model.</p>
        </div>
        <div className="pillar">
          <h3>ESG bolted on</h3>
          <p>Compliance teams produce ratings in PDFs. Procurement teams never see them in workflow. Helio scores every supplier inline.</p>
        </div>
      </div>
    </section>
  )
}
