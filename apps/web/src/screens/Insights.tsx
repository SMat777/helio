import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { data: suppliers = [] } = useSuppliersQuery()
  const insights = useMemo(() => getInsights(suppliers), [suppliers])

  return (
    <AppShell slim crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Insights</>}>
      <div className="px-6 py-5">
        <PageHead
          eyebrow="Workspace · Portfolio findings"
          title="What the numbers are telling you."
          lede="Auto-generated findings across risk, spend and concentration — each one links straight to the suppliers behind it, so you can act, not just read."
        />

        <div className="grid grid-cols-2 gap-4">
          {insights.map((it) => (
            <Card
              key={it.id}
              onClick={it.href ? () => navigate(it.href!) : undefined}
              className={`group flex flex-col px-5 py-4 ${it.href ? 'cursor-pointer transition-shadow duration-200 hover:shadow-[0_10px_28px_-14px_rgba(40,30,20,0.3)]' : ''}`}
              style={{ borderLeft: `3px solid ${toneVar[it.tone]}` }}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="m-0 font-serif text-[20px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink">{it.title}</h3>
                {it.metric && <Pill tone={tonePill[it.tone]} dot>{it.metric}</Pill>}
              </div>
              <p className="m-0 text-[14px] leading-[1.6] text-ink-2">{it.body}</p>
              {it.action && (
                <div className="mt-3.5 flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-accent">
                  {it.action} <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
