import { riskColor } from '../lib/risk'

// kilde: .t-risk-score — tal + farvet bar; farve fra risk.ts (eneste sandhed).
export function RiskScore({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = riskColor(score)
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="min-w-[22px] text-right font-mono text-[13px] font-semibold tabular-nums"
        style={{ color }}
      >
        {score}
      </span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-rail">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </span>
    </div>
  )
}
