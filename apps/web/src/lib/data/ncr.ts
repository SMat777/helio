import type { Ncr, NcrRow, NcrSeverity, NcrStatus } from '../types'
import { SUPPLIERS } from './suppliers'
import { seededRng, pickFrom, intBetween, isoDate, NOW, addDays } from './seed'

// One complete NCR for the /ncr/new screen (HANDOFF §6: NCR5_SUP + NCR5_SECTIONS).
// Supplier links to SUP-184 Heliox Polymers — the critical supplier in the list.
export const NCR: Ncr = {
  id: 'NCR-2024-0312',
  supplierId: 'SUP-184',
  supplierName: 'Heliox Polymers GmbH',
  country: 'DE',
  segment: 'Strategic',
  severity: 'critical',
  status: 'draft',
  openedAt: '2024-04-28',
  dueAt: '2024-06-04',
  dPhase: 'D4',
  costImpactEur: 18_000,
  sections: [
    { n: 1, title: 'What happened', body: 'Batch HX-2407-19 shipped April 26 showed viscosity 28% below the contractual spec (47.2 vs. 65±5 cP) across 4 of 6 sampled units. The deviation was caught at our Aarhus DC during incoming QA.' },
    { n: 2, title: 'Impact', body: 'Two production lines were paused for 6 hours pending replacement stock. Estimated cost impact €18k; downstream customer order LO-44912 is now 48 hours late. No safety incidents.' },
    { n: 3, title: 'Immediate containment', body: 'All Heliox polymer batches received since April 1 are quarantined pending re-test. Customer notified. Replacement batch HX-2407-21 confirmed in-spec and shipped April 30.' },
    { n: 4, title: 'Suspected root cause', placeholder: 'Describe the suspected root cause. Include any process, equipment, material or environmental factors. (Will become D4 in the 8D record.)' },
  ],
}

// ── Per-supplier NCR rows (detail tab) + portfolio list ───────────────────────
const TITLES = [
  'Out-of-spec viscosity',
  'Dimensional tolerance deviation',
  'Late delivery — line stop',
  'Surface finish defect',
  'Documentation mismatch',
  'Contamination found in batch',
  'Packaging damage on receipt',
  'Failed incoming inspection',
]

// Map the canonical NCR doc to a row so SUP-184's tab shows it too.
function canonicalRow(): NcrRow {
  return {
    id: NCR.id,
    supplierId: NCR.supplierId,
    title: 'Out-of-spec viscosity',
    severity: NCR.severity,
    status: 'open',
    openedAt: NCR.openedAt,
    dueAt: NCR.dueAt,
    costImpactEur: NCR.costImpactEur,
  }
}

function generate(supplierId: string): NcrRow[] {
  const s = SUPPLIERS.find((x) => x.id === supplierId)
  if (!s) return []
  const idx = SUPPLIERS.indexOf(s)
  const rng = seededRng(`ncrs:${s.id}`)
  const rows: NcrRow[] = []

  // Open NCRs mirror the supplier's open count; add a few historical closed ones.
  const open = s.ncrs
  const closed = intBetween(rng, 1, 3)
  const total = open + closed
  for (let i = 0; i < total; i++) {
    const isOpen = i < open
    const severity: NcrSeverity = isOpen
      ? s.riskScore >= 75 ? 'critical' : s.riskScore >= 65 ? 'major' : 'minor'
      : pickFrom(rng, ['minor', 'major'] as NcrSeverity[])
    const opened = addDays(NOW, -intBetween(rng, isOpen ? 5 : 60, isOpen ? 60 : 400))
    const due = addDays(opened, intBetween(rng, 30, 45))
    const status: NcrStatus = isOpen ? (severity === 'critical' ? '8d' : 'open') : 'closed'
    rows.push({
      // Deterministic + globally unique: supplier index (×9) + row index, never colliding.
      id: `NCR-2024-${String(1001 + idx * 9 + i).padStart(4, '0')}`,
      supplierId: s.id,
      title: pickFrom(rng, TITLES),
      severity,
      status,
      openedAt: isoDate(opened),
      dueAt: isoDate(due),
      costImpactEur: intBetween(rng, 2, 40) * 1000,
    })
  }
  return rows
}

export function getNcrsForSupplier(supplierId: string): NcrRow[] {
  const rows = generate(supplierId)
  if (supplierId === NCR.supplierId) {
    // Surface the canonical doc first, drop one generated open row to keep the count honest.
    const withoutOneOpen = rows.slice(1)
    return [canonicalRow(), ...withoutOneOpen]
  }
  return rows
}

export function getNcrs(): NcrRow[] {
  return SUPPLIERS.flatMap((s) => getNcrsForSupplier(s.id))
}
