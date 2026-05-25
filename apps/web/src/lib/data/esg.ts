import type { Esg, EsgRating, Supplier } from '../types'
import { SUPPLIERS } from './suppliers'
import { seededRng, intBetween } from './seed'

function ratingFor(overall: number): EsgRating {
  if (overall >= 80) return 'A'
  if (overall >= 65) return 'B'
  if (overall >= 50) return 'C'
  return 'D'
}

// ESG loosely tracks scorecard quality but with its own seeded spread per pillar.
function generate(s: Supplier): Esg {
  const rng = seededRng(`esg:${s.id}`)
  const base = Math.round(s.scorecard * 0.6 + 25)
  const clamp = (n: number) => Math.min(98, Math.max(35, n))
  const e = clamp(base + intBetween(rng, -12, 12))
  const soc = clamp(base + intBetween(rng, -10, 14))
  const g = clamp(base + intBetween(rng, -8, 16))
  const overall = Math.round((e + soc + g) / 3)
  return {
    supplierId: s.id,
    e,
    s: soc,
    g,
    overall,
    rating: ratingFor(overall),
    scope2Verified: rng() > 0.45,
  }
}

export function getEsg(supplierId?: string): Esg[] {
  if (supplierId) {
    const s = SUPPLIERS.find((x) => x.id === supplierId)
    return s ? [generate(s)] : []
  }
  return SUPPLIERS.map(generate)
}
