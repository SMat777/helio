// Underline tab bar with optional count badges (kilde: .t-tabs / V5Tabs).
export type Tab = { id: string; label: string; count?: number }

export function Tabs({ tabs, active, onChange, className = '' }: {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={`flex border-b border-line ${className}`}>
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`-mb-px cursor-pointer border-b-2 px-3.5 py-3 text-[14px] font-medium ${
              isActive ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className="ml-1.5 rounded bg-rail px-[6px] py-px font-mono text-[11.5px] text-ink-3">{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
