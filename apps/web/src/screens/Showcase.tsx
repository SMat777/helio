import { Pill } from '../ui/Pill'
import { Button } from '../ui/Button'
import { Card, CardHead, CardBody } from '../ui/Card'
import { KPI } from '../ui/KPI'
import { Sparkline } from '../ui/Sparkline'
import { RiskScore } from '../ui/RiskScore'

import type { ReactNode } from 'react'

const spark = [42, 45, 43, 48, 52, 49, 55, 58, 54, 61]

// Lille sektion-wrapper med mono-overskrift.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  )
}

export default function Showcase() {
  return (
    <div className="mx-auto max-w-[900px] px-8 py-10">
      <header className="mb-10">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">Helio · Showcase</div>
        <h1 className="m-0 mt-1 text-[17px] font-semibold tracking-[-0.01em]">UI primitives</h1>
      </header>

      <Section title="Pills">
        <Pill tone="good" dot>On track</Pill>
        <Pill tone="warn" dot>Watch</Pill>
        <Pill tone="bad" dot>Critical</Pill>
        <Pill tone="muted">Tier 2</Pill>
        <Pill tone="outline">Strategic</Pill>
      </Section>

      <Section title="Buttons">
        <Button variant="default">Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="ghost">Ghost</Button>
      </Section>

      <Section title="Cards">
        <Card className="w-[260px]">
          <CardHead title="Risk over time" sub="90d" />
          <CardBody>
            <Sparkline data={spark} />
          </CardBody>
        </Card>
        <Card flat className="w-[260px]">
          <CardHead title="Flat card" sub="variant" />
          <CardBody>Body content.</CardBody>
        </Card>
      </Section>

      <Section title="KPIs">
        <Card className="w-[200px]"><KPI label="Suppliers" value="247" delta="+12" dir="up" /></Card>
        <Card className="w-[200px]"><KPI label="At risk" value="18" delta="+3" dir="down" note="30d" /></Card>
        <Card className="w-[200px]"><KPI label="Open NCRs" value="23" unit="open" hero /></Card>
      </Section>

      <Section title="Sparkline">
        <div className="w-[200px]"><Sparkline data={spark} /></div>
        <div className="w-[200px]"><Sparkline data={spark} color="var(--bad)" area={false} /></div>
      </Section>

      <Section title="Risk score">
        <div className="w-[220px]"><RiskScore score={32} /></div>
        <div className="w-[220px]"><RiskScore score={68} /></div>
        <div className="w-[220px]"><RiskScore score={82} /></div>
      </Section>
    </div>
  )
}
