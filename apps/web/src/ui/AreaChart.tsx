// Larger area chart for the "Risk over time" widget (kilde: AreaChart i tether-primitives.jsx).
// Single primary series with gradient fill + optional dashed comparison series.
export function AreaChart({ data, compare, color = 'var(--accent)', height = 180, labels }: {
  data: number[]
  compare?: number[]
  color?: string
  height?: number
  labels?: string[]
}) {
  const w = 600
  const h = 160
  const padX = 8
  const padTop = 12
  const padBot = 22
  const all = compare ? [...data, ...compare] : data
  const min = Math.min(...all)
  const max = Math.max(...all)
  const range = max - min || 1
  const stepX = (w - padX * 2) / (data.length - 1)
  const toPath = (series: number[]) =>
    'M' + series.map((v, i) => `${padX + i * stepX} ${padTop + (h - padTop - padBot) * (1 - (v - min) / range)}`).join(' L ')
  const gid = 'ag-' + color.replace(/[^a-z0-9]/gi, '')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={padX} x2={w - padX} y1={padTop + ((h - padTop - padBot) * i) / 3} y2={padTop + ((h - padTop - padBot) * i) / 3} stroke="var(--line-2)" strokeWidth="1" />
      ))}
      <path d={`${toPath(data)} L ${w - padX} ${h - padBot} L ${padX} ${h - padBot} Z`} fill={`url(#${gid})`} />
      <path d={toPath(data)} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      {compare && <path d={toPath(compare)} fill="none" stroke="var(--ink-3)" strokeWidth="1.2" strokeDasharray="3 3" />}
      {labels?.map((l, i) => (
        <text key={i} x={padX + (i * (w - padX * 2)) / (labels.length - 1)} y={h - 6} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)">{l}</text>
      ))}
    </svg>
  )
}
