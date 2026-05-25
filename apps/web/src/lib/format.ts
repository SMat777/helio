// Shared money formatting — single source so screens agree on €-rendering.

// Compact tiers: €1.2B / €4.2M / €640k / €420. Billions tier added so the
// Contracts total (~€1188M) reads €1.2B instead of a four-digit million.
export function fmtMoney(eur: number): string {
  if (eur >= 1_000_000_000) return `€${(eur / 1_000_000_000).toFixed(1)}B`
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`
  if (eur >= 1_000) return `€${Math.round(eur / 1_000)}k`
  return `€${eur.toLocaleString('en-US')}`
}

// Forced-millions, one decimal: €48.2M. Used for segment/portfolio totals that
// always sit in the millions, so the unit stays stable across rows.
const millions = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export function fmtMoneyM(eur: number): string {
  return `€${millions.format(eur / 1e6)}M`
}
