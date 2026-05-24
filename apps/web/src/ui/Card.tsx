import type { CSSProperties, ReactNode } from 'react'

export function Card({ flat = false, children, className = '', style }: {
  flat?: boolean
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`bg-card border border-line ${flat ? 'rounded-lg' : 'rounded-[10px]'} ${className}`} style={style}>
      {children}
    </div>
  )
}

// Kort-overskrift med valgfri mono-subtitle til højre.
export function CardHead({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2.5 px-4 pt-3 pb-2">
      <h3 className="m-0 text-[13px] font-semibold tracking-[-0.005em]">{title}</h3>
      {sub && (
        <span className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-3">{sub}</span>
      )}
    </div>
  )
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="px-4 pt-1 pb-3.5">{children}</div>
}
