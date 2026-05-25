import type { ReactNode } from 'react'

export type KPIDir = 'up' | 'down' | 'flat'

const deltaColor: Record<KPIDir, string> = {
  up: 'text-good',
  down: 'text-bad',
  flat: 'text-ink-3',
}
const deltaArrow: Record<KPIDir, string> = { up: '↑', down: '↓', flat: '→' }

export function KPI({ label, value, unit, delta, dir = 'flat', note, hero = false }: {
  label: ReactNode
  value: ReactNode
  unit?: string
  delta?: string
  dir?: KPIDir
  note?: ReactNode
  hero?: boolean
}) {
  return (
    <div className="px-4 pt-3.5 pb-4">
      <div className="mb-2 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
        <span>{label}</span>
        {note && <span>{note}</span>}
      </div>
      <div
        className={
          hero
            ? 'font-serif text-kpi-hero font-semibold leading-none tracking-[-0.02em] tabular-nums'
            : 'font-serif text-kpi font-semibold leading-none tracking-[-0.02em] tabular-nums'
        }
      >
        {value}
        {unit && (
          <span className={hero ? 'ml-1 font-sans text-[20px] font-medium text-ink-3' : 'ml-0.5 font-sans text-[15px] font-medium text-ink-3'}>
            {unit}
          </span>
        )}
      </div>
      {delta && (
        <div className={`mt-2.5 flex items-center gap-1.5 font-mono text-[11.5px] ${deltaColor[dir]}`}>
          <span>{deltaArrow[dir]}</span>
          {delta}
        </div>
      )}
    </div>
  )
}
