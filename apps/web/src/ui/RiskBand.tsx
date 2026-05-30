// Suppliers-by-risk-band distribution: stacked bar + 4-col legend (kilde: DV3Distribution).
import { Link } from 'react-router-dom'

export type Band = { label: string; range: string; n: number; color: string }

export function RiskBand({ bands, compact = false, bandHref }: {
  bands: Band[]
  compact?: boolean
  bandHref?: (label: string) => string
}) {
  const total = bands.reduce((s, b) => s + b.n, 0) || 1
  return (
    <div>
      <div className={`flex items-baseline justify-between ${compact ? 'mb-2.5' : 'mb-3.5'}`}>
        <h3 className="m-0 text-[13px] font-semibold tracking-[-0.005em]">Suppliers by risk band</h3>
        <span className="font-mono text-[11px] tabular-nums text-ink-3">n = {total} · live</span>
      </div>
      <div className={`mb-3.5 flex overflow-hidden rounded-full bg-line ${compact ? 'h-3' : 'h-4'}`}>
        {bands.map((b) => {
          const width = `${(b.n / total) * 100}%`
          return bandHref ? (
            <Link
              key={b.label}
              to={bandHref(b.label)}
              style={{ width }}
              title={`${b.label}: ${b.n}`}
              aria-label={`Filter suppliers by ${b.label} risk`}
              className="block transition-opacity hover:opacity-75"
            >
              <span className="block h-full w-full" style={{ background: b.color }} />
            </Link>
          ) : (
            <div key={b.label} style={{ background: b.color, width }} title={`${b.label}: ${b.n}`} />
          )
        })}
      </div>
      <div className="grid grid-cols-4 gap-x-[18px] gap-y-2">
        {bands.map((b) => {
          const row = (
            <>
              <span className="mt-1 h-2 w-2 rounded-full" style={{ background: b.color }} />
              <div>
                <div className="text-[12.5px] font-medium text-ink">{b.label}</div>
                <div className="mt-px font-mono text-[10.5px] text-ink-3">{b.range}</div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-medium tabular-nums">{b.n}</div>
                <div className="font-mono text-[10.5px] text-ink-3">{((b.n / total) * 100).toFixed(0)}%</div>
              </div>
            </>
          )
          return bandHref ? (
            <Link
              key={b.label}
              to={bandHref(b.label)}
              aria-label={`Filter suppliers by ${b.label} risk`}
              className="-mx-1 grid grid-cols-[auto_1fr_auto] items-baseline gap-2 rounded-md px-1 py-0.5 text-ink no-underline transition-colors hover:bg-hover"
            >
              {row}
            </Link>
          ) : (
            <div key={b.label} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2">
              {row}
            </div>
          )
        })}
      </div>
    </div>
  )
}
