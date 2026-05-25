import { useRef, useState, useMemo, useLayoutEffect } from 'react'

export type Threshold = { value: number; label: string; color: string }

// Interactive risk/trend area chart — hand-rolled SVG, measured width (no
// stretch distortion), y-axis, subtle gridlines, gradient fill, hover crosshair
// + tooltip, and current/min/max markers. Keeps the Editorial Cream DNA.
export function AreaChart({
  data,
  labels,
  color = 'var(--accent)',
  height = 200,
  yDomain,
  thresholds,
  formatValue = (v) => String(Math.round(v)),
  pointLabel,
}: {
  data: number[]
  labels?: string[]
  color?: string
  height?: number
  yDomain?: [number, number]
  thresholds?: Threshold[]
  formatValue?: (v: number) => string
  pointLabel?: (i: number) => string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(720)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    setW(el.clientWidth)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const padL = 34
  const padR = 14
  const padTop = 14
  const padBot = 26
  const innerW = Math.max(1, w - padL - padR)
  const innerH = Math.max(1, height - padTop - padBot)

  const { min, max } = useMemo(() => {
    if (yDomain) return { min: yDomain[0], max: yDomain[1] }
    const lo = Math.min(...data)
    const hi = Math.max(...data)
    const pad = (hi - lo) * 0.15 || 5
    return { min: Math.max(0, Math.floor(lo - pad)), max: Math.ceil(hi + pad) }
  }, [data, yDomain])
  const range = max - min || 1

  const x = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1))
  const y = (v: number) => padTop + innerH * (1 - (v - min) / range)

  const linePath = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${x(data.length - 1).toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`

  const gid = 'ag-' + color.replace(/[^a-z0-9]/gi, '')
  const lastIdx = data.length - 1
  const maxIdx = data.indexOf(Math.max(...data))
  const minIdx = data.indexOf(Math.min(...data))

  // Horizontal gridlines at 4 even steps, labelled on the y-axis.
  const ticks = [0, 1, 2, 3, 4].map((i) => min + (range * i) / 4)

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left - padL
    const i = Math.round((px / innerW) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }

  const hv = hover != null ? data[hover] : null

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <svg width={w} height={height} className="block">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.20" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--line-2)" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--ink-4)">
              {Math.round(t)}
            </text>
          </g>
        ))}

        {/* threshold reference lines (e.g. risk bands) */}
        {thresholds?.filter((t) => t.value >= min && t.value <= max).map((t) => (
          <g key={t.label}>
            <line x1={padL} x2={w - padR} y1={y(t.value)} y2={y(t.value)} stroke={t.color} strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
            <text x={w - padR} y={y(t.value) - 4} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill={t.color} opacity="0.85">{t.label}</text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gid})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* min / max markers */}
        {[minIdx, maxIdx].map((idx, k) => (
          <circle key={k} cx={x(idx)} cy={y(data[idx])} r="3" fill="var(--card)" stroke={color} strokeWidth="1.5" />
        ))}
        {/* current value marker */}
        <circle cx={x(lastIdx)} cy={y(data[lastIdx])} r="4" fill={color} stroke="var(--card)" strokeWidth="2" />

        {/* hover crosshair + dot */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padTop} y2={padTop + innerH} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover])} r="4.5" fill={color} stroke="var(--card)" strokeWidth="2" />
          </g>
        )}

        {/* x labels */}
        {labels?.map((l, i) => (
          <text key={i} x={padL + (i * innerW) / (labels.length - 1)} y={height - 8} textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--ink-3)">{l}</text>
        ))}

        {/* pointer capture overlay */}
        <rect x={padL} y={padTop} width={innerW} height={innerH} fill="transparent" style={{ cursor: 'crosshair' }}
          onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
      </svg>

      {/* tooltip */}
      {hover != null && hv != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-line bg-card px-2.5 py-1.5 shadow-[0_6px_20px_-8px_rgba(40,30,20,0.35)]"
          style={{ left: Math.min(Math.max(x(hover), 60), w - 60), top: Math.max(0, y(hv) - 52) }}
        >
          <div className="font-serif text-[18px] font-semibold leading-none tabular-nums" style={{ color }}>{formatValue(hv)}</div>
          <div className="mt-1 font-mono text-[10.5px] text-ink-3">{pointLabel ? pointLabel(hover) : `point ${hover + 1}`}</div>
        </div>
      )}
    </div>
  )
}
