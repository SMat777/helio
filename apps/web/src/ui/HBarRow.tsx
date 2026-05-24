import type { ReactNode } from 'react'

export type BarTone = 'accent' | 'good' | 'warn' | 'bad'

const fillColor: Record<BarTone, string> = {
  accent: 'var(--accent)',
  good: 'var(--good)',
  warn: 'var(--warn)',
  bad: 'var(--bad)',
}

// One horizontal bar row: label · track · value (kilde: .t-bar-h .row). Used in the risk radar.
export function HBarRow({ label, value, pct, tone = 'accent', onClick }: {
  label: ReactNode
  value: ReactNode
  pct: number
  tone?: BarTone
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`grid grid-cols-[110px_1fr_56px] items-center gap-2.5 text-[12.5px] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className="truncate text-ink-2">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-rail">
        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: fillColor[tone] }} />
      </span>
      <span className="text-right font-mono text-[12px] tabular-nums text-ink">{value}</span>
    </div>
  )
}

export function HBarGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>
}
