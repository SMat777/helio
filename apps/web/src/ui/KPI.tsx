import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type KPIDir = 'up' | 'down' | 'flat'

const deltaColor: Record<KPIDir, string> = {
  up: 'text-good',
  down: 'text-bad',
  flat: 'text-ink-3',
}
const deltaArrow: Record<KPIDir, string> = { up: '↑', down: '↓', flat: '→' }

export function KPI({ label, value, unit, delta, dir = 'flat', note, hero = false, to }: {
  label: ReactNode
  value: ReactNode
  unit?: string
  delta?: string
  dir?: KPIDir
  note?: ReactNode
  hero?: boolean
  to?: string
}) {
  const inner = (
    <>
      <div className="mb-2 flex justify-between font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink-3">
        <span className="flex items-center gap-1">
          {label}
          {to && <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">→</span>}
        </span>
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
    </>
  )

  if (to) {
    return (
      <Link to={to} className="group block px-4 pt-3.5 pb-4 text-ink no-underline transition-colors hover:bg-hover">
        {inner}
      </Link>
    )
  }
  return <div className="px-4 pt-3.5 pb-4">{inner}</div>
}
