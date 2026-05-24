export type RiskBand = 'Low' | 'Watch' | 'Elevated' | 'Critical'

// Klassificerer en risikoscore i et bånd — eneste sandhed for tærskler (HANDOFF §7).
export function riskBand(score: number): RiskBand {
  if (score >= 75) return 'Critical'
  if (score >= 65) return 'Elevated'
  if (score >= 40) return 'Watch'
  return 'Low'
}

// Vælger den semantiske farve-token for en score (HANDOFF §3).
export function riskColor(score: number): string {
  if (score >= 75) return 'var(--bad)'
  if (score >= 65) return 'var(--warn)'
  return 'var(--good)'
}
