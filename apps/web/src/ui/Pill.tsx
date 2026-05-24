import type { ReactNode } from 'react'

export type PillTone = 'good' | 'warn' | 'bad' | 'muted' | 'outline'

// Farve kommer fra de semantiske tokens (kilde: .t-pill).
const toneClasses: Record<PillTone, string> = {
  good: 'bg-good-bg text-good',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
  muted: 'bg-rail text-ink-2',
  outline: 'bg-transparent text-ink-2 border border-line-3',
}

export function Pill({ tone = 'muted', dot = false, children }: {
  tone?: PillTone
  dot?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-full px-[7px] py-0.5 font-mono text-[11px] font-medium leading-[1.6] tracking-[0.02em] ${toneClasses[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
