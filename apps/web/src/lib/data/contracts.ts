import type { Contract, Supplier } from '../types'
import { SUPPLIERS } from './suppliers'
import { seededRng, pickFrom, intBetween, isoDate, NOW, addMonths } from './seed'

const TYPES: Contract['type'][] = ['Supply', 'Framework', 'Quality', 'Logistics', 'NDA']

function statusFor(end: Date): Contract['status'] {
  const days = Math.round((end.getTime() - NOW.getTime()) / 86_400_000)
  if (days < 0) return 'expired'
  if (days < 60) return 'expiring'
  return 'active'
}

function generate(s: Supplier): Contract[] {
  const rng = seededRng(`contracts:${s.id}`)
  const n = intBetween(rng, 1, 3)
  const out: Contract[] = []
  for (let i = 0; i < n; i++) {
    const type = pickFrom(rng, TYPES)
    const start = addMonths(NOW, -intBetween(rng, 6, 36))
    const end = addMonths(start, intBetween(rng, 12, 48))
    const valueEur = Math.round((s.spendEur * (0.3 + rng() * 0.7)) / 1000) * 1000
    out.push({
      id: `CT-${s.id.replace('SUP-', '')}-${i + 1}`,
      supplierId: s.id,
      title: `${s.category.split(/[·,]/)[0].trim()} ${type}`,
      type,
      valueEur,
      start: isoDate(start),
      end: isoDate(end),
      status: statusFor(end),
    })
  }
  return out
}

// id given → that supplier's contracts; omitted → the whole portfolio.
export function getContracts(supplierId?: string): Contract[] {
  if (supplierId) {
    const s = SUPPLIERS.find((x) => x.id === supplierId)
    return s ? generate(s) : []
  }
  return SUPPLIERS.flatMap(generate)
}
