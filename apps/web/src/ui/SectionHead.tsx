import type { ReactNode } from 'react'

// Mono uppercase section heading with a trailing rule (kilde: .t-sec).
export function SectionHead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 ${className}`}>
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
