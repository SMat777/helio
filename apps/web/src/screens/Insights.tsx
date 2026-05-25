import { useMemo } from 'react'
import { AppShell } from '../ui/AppShell'
import { Card } from '../ui/Card'
import { Pill } from '../ui/Pill'
import { PageHead } from '../ui/PageHead'
import { getInsights, type Insight } from '../lib/data'
import { useSuppliersQuery } from '../lib/data/suppliersRepo'

const toneVar: Record<Insight['tone'], string> = {
  good: 'var(--good)',
  warn: 'var(--warn)',
  bad: 'var(--bad)',
}
const tonePill: Record<Insight['tone'], 'good' | 'warn' | 'bad'> = {
  good: 'good',
  warn: 'warn',
  bad: 'bad',
}

export default function Insights() {
  const { data: suppliers = [] } = useSuppliersQuery()
  const insights = useMemo(() => getInsights(suppliers), [suppliers])

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Insights</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Workspace · Portfolio findings"
          title="What the numbers are telling you."
          lede="Auto-generated findings across risk, spend and concentration — the few things worth acting on this week, ahead of the detail."
        />

        <div className="grid grid-cols-2 gap-4">
          {insights.map((it) => (
            <Card key={it.id} className="flex flex-col px-5 py-4" style={{ borderLeft: `3px solid ${toneVar[it.tone]}` }}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="m-0 font-serif text-[19px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink">{it.title}</h3>
                {it.metric && <Pill tone={tonePill[it.tone]} dot>{it.metric}</Pill>}
              </div>
              <p className="m-0 text-[13.5px] leading-[1.55] text-ink-2">{it.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
