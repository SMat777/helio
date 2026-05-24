// Segmented control (kilde: V6ViewToggle) — e.g. Matrix / Table / Cards on Suppliers.
export type SegOption<T extends string> = { id: T; label: string }

export function SegmentToggle<T extends string>({ options, value, onChange }: {
  options: SegOption<T>[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-line bg-card p-0.5">
      {options.map((o) => {
        const isActive = o.id === value
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[12px] font-medium ${
              isActive ? 'bg-ink text-white' : 'bg-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
