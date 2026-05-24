import { sparklinePoints, sparklinePath } from '../lib/sparkline'

export function Sparkline({ data, color = 'var(--accent)', height = 36, area = true }: {
  data: number[]
  color?: string
  height?: number
  area?: boolean
}) {
  const w = 100
  const h = 30
  const pad = 2
  const pts = sparklinePoints(data, w, h, pad)
  const path = sparklinePath(pts)
  const areaPath = `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
      {area && <path d={areaPath} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="1.6" fill={color} />
    </svg>
  )
}
