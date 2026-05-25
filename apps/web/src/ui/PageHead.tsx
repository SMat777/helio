import type { ReactNode } from 'react'

// Shared page header for the section screens — eyebrow · display title · lede · actions.
export function PageHead({ eyebrow, title, lede, actions }: {
  eyebrow?: ReactNode
  title: ReactNode
  lede?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">{eyebrow}</div>
        )}
        <h1 className="m-0 font-serif text-[32px] leading-[1.05] tracking-[-0.02em] text-ink">{title}</h1>
        {lede && <p className="mt-2.5 max-w-[68ch] text-[15px] leading-[1.55] text-ink-2">{lede}</p>}
      </div>
      {actions && <div className="flex flex-none items-center gap-2.5">{actions}</div>}
    </div>
  )
}
