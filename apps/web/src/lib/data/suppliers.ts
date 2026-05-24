import type { Supplier, Segment, Tier } from '../types'

// ── 12 named seed suppliers (HANDOFF §6: SUPPLIERS_DATA + DV2 needs-attention overlay) ──
const named: Supplier[] = [
  { id: 'SUP-104', name: 'DS-PKG-104', country: 'GB', category: 'Packaging · Cardboard', segment: 'Strategic', tier: 1, scorecard: 93, riskScore: 62, onTimePct: 97.0, qualityPct: 93, ncrs: 0, spend: '€4.2M', spendEur: 4_200_000, trend: [78, 80, 82, 85, 88, 90, 91, 92, 93, 93, 92, 93], change: '0', reason: 'Single source · 100% of category' },
  { id: 'SUP-184', name: 'Heliox Polymers', country: 'DE', category: 'Specialty Chemicals', segment: 'Strategic', tier: 1, scorecard: 71, riskScore: 76, onTimePct: 87.4, qualityPct: 88, ncrs: 2, spend: '€2.1M', spendEur: 2_100_000, trend: [88, 87, 87, 85, 82, 80, 77, 75, 73, 72, 71, 71], change: '+18', reason: 'Quality −8.7pp' },
  { id: 'SUP-091', name: 'Factory Yeo Ltd.', country: 'CN', category: 'Electronics · Sensors', segment: 'Bottleneck', tier: 2, scorecard: 68, riskScore: 71, onTimePct: 91.2, qualityPct: 84, ncrs: 1, spend: '€1.4M', spendEur: 1_400_000, trend: [80, 78, 76, 74, 72, 70, 69, 68, 68, 67, 68, 68], change: '+9', reason: 'Critical NCR · 8D by Jun 4' },
  { id: 'SUP-203', name: 'Pacific Sensors Inc.', country: 'TW', category: 'Electronics · Sensors', segment: 'Strategic', tier: 1, scorecard: 74, riskScore: 68, onTimePct: 94.0, qualityPct: 89, ncrs: 0, spend: '€0.9M', spendEur: 900_000, trend: [80, 79, 79, 78, 77, 76, 75, 75, 74, 74, 73, 74], change: '+5', reason: 'On-time slipping 4 weeks' },
  { id: 'SUP-112', name: 'NorPack AS', country: 'NO', category: 'Packaging · Cardboard', segment: 'Leverage', tier: 1, scorecard: 82, riskScore: 64, onTimePct: 96.1, qualityPct: 91, ncrs: 0, spend: '€3.2M', spendEur: 3_200_000, trend: [78, 79, 80, 80, 81, 81, 82, 82, 82, 82, 82, 82], change: '+3', reason: 'Contract expires 21 days' },
  { id: 'SUP-077', name: 'Lima Steel S.A.', country: 'PE', category: 'Raw materials · Steel', segment: 'Strategic', tier: 1, scorecard: 88, riskScore: 42, onTimePct: 98.3, qualityPct: 95, ncrs: 0, spend: '€8.1M', spendEur: 8_100_000, trend: [78, 80, 82, 84, 85, 86, 87, 87, 88, 88, 88, 88] },
  { id: 'SUP-018', name: 'BASF Speciality DE', country: 'DE', category: 'Specialty Chemicals', segment: 'Strategic', tier: 1, scorecard: 91, riskScore: 38, onTimePct: 99.1, qualityPct: 96, ncrs: 0, spend: '€6.7M', spendEur: 6_700_000, trend: [88, 89, 89, 90, 90, 90, 91, 91, 91, 91, 91, 91] },
  { id: 'SUP-022', name: 'Roche-Chem GmbH', country: 'CH', category: 'Specialty Chemicals', segment: 'Strategic', tier: 1, scorecard: 90, riskScore: 35, onTimePct: 98.7, qualityPct: 95, ncrs: 0, spend: '€5.4M', spendEur: 5_400_000, trend: [85, 86, 87, 87, 88, 88, 89, 89, 89, 90, 90, 90] },
  { id: 'SUP-301', name: 'Aarhus Pack ApS', country: 'DK', category: 'Packaging · Cardboard', segment: 'Routine', tier: 2, scorecard: 79, riskScore: 31, onTimePct: 96.5, qualityPct: 88, ncrs: 0, spend: '€0.4M', spendEur: 400_000, trend: [75, 76, 76, 77, 77, 78, 78, 78, 79, 79, 79, 79] },
  { id: 'SUP-145', name: 'Mekong Logistics', country: 'VN', category: 'Logistics · APAC', segment: 'Leverage', tier: 2, scorecard: 73, riskScore: 54, onTimePct: 92.0, qualityPct: 85, ncrs: 1, spend: '€1.1M', spendEur: 1_100_000, trend: [78, 77, 76, 75, 74, 74, 73, 73, 73, 73, 73, 73] },
  { id: 'SUP-256', name: 'GMP Sealants Ltd.', country: 'GB', category: 'Specialty Chemicals', segment: 'Routine', tier: 2, scorecard: 81, riskScore: 33, onTimePct: 95.4, qualityPct: 89, ncrs: 0, spend: '€0.6M', spendEur: 600_000, trend: [78, 79, 79, 80, 80, 81, 81, 81, 81, 81, 81, 81] },
  { id: 'SUP-118', name: 'Iberia Carton SA', country: 'ES', category: 'Packaging · Cardboard', segment: 'Routine', tier: 2, scorecard: 77, riskScore: 46, onTimePct: 94.0, qualityPct: 87, ncrs: 0, spend: '€0.5M', spendEur: 500_000, trend: [78, 78, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77] },
]

// ── Deterministic synthetic fill → 247 total, matching the design's band counts ──
// Named bands: Low 4 · Watch 5 · Elevated 2 · Critical 1.
// Target totals (HANDOFF / DV3_RISK_BANDS): Low 168 · Watch 61 · Elevated 14 · Critical 4.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(184)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]

const NAME_A = ['Nordic', 'Apex', 'Vertex', 'Meridian', 'Atlas', 'Cobalt', 'Lumen', 'Orbit', 'Delta', 'Solace', 'Verde', 'Quanta', 'Pioneer', 'Summit', 'Helix', 'Aurora', 'Forge', 'Cascade', 'Pinnacle', 'Anchor']
const NAME_B = ['Materials', 'Industries', 'Components', 'Group', 'Logistics', 'Polymers', 'Steel', 'Packaging', 'Sensors', 'Systems', 'Chemicals', 'Works', 'Supply', 'Partners', 'Trading']
const NAME_SUFFIX = ['GmbH', 'AS', 'Ltd.', 'Inc.', 'SA', 'ApS', 'BV', 'AB', 'S.p.A', 'Co.']
const COUNTRIES = ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'SE', 'DK', 'NO', 'PL', 'CN', 'TW', 'VN', 'IN', 'US', 'CH', 'BE', 'AT', 'PT', 'CZ']
const CATEGORIES = ['Packaging · Cardboard', 'Specialty Chemicals', 'Electronics · Sensors', 'Raw materials · Steel', 'Logistics · APAC', 'Logistics · EU', 'Machined parts', 'Adhesives & Sealants', 'Textiles', 'Plastics · Injection']
const SEGMENTS: Segment[] = ['Strategic', 'Bottleneck', 'Leverage', 'Routine']

let counter = 400
function makeSynthetic(count: number, lo: number, hi: number): Supplier[] {
  const out: Supplier[] = []
  for (let i = 0; i < count; i++) {
    const riskScore = Math.min(100, Math.max(0, Math.floor(lo + rnd() * (hi - lo))))
    const scorecard = Math.min(98, Math.max(45, Math.round(100 - riskScore * 0.7 + (rnd() * 12 - 6))))
    const onTimePct = Math.round((100 - riskScore * 0.18 - rnd() * 4) * 10) / 10
    const qualityPct = Math.min(99, Math.max(70, Math.round(98 - riskScore * 0.14 - rnd() * 5)))
    const ncrs = riskScore >= 65 ? (rnd() > 0.5 ? 1 : 2) : riskScore >= 45 ? (rnd() > 0.7 ? 1 : 0) : 0
    const spendM = Math.round((0.2 + rnd() * 7) * 10) / 10
    const segment: Segment = pick(SEGMENTS)
    const tier: Tier = (rnd() > 0.6 ? 1 : rnd() > 0.4 ? 2 : 3) as Tier
    const id = `SUP-${counter++}`
    const trend = Array.from({ length: 12 }, (_, j) => {
      const drift = (j - 6) * (riskScore > 50 ? 0.4 : -0.2)
      return Math.min(100, Math.max(0, Math.round(scorecard - drift + (rnd() * 6 - 3))))
    })
    out.push({
      id,
      name: `${pick(NAME_A)} ${pick(NAME_B)} ${pick(NAME_SUFFIX)}`,
      country: pick(COUNTRIES),
      category: pick(CATEGORIES),
      segment,
      tier,
      scorecard,
      riskScore,
      onTimePct,
      qualityPct,
      ncrs,
      spend: `€${spendM.toFixed(1)}M`,
      spendEur: Math.round(spendM * 1_000_000),
      trend,
    })
  }
  return out
}

const synthetic: Supplier[] = [
  ...makeSynthetic(164, 8, 39), // Low
  ...makeSynthetic(56, 40, 64), // Watch
  ...makeSynthetic(12, 65, 74), // Elevated
  ...makeSynthetic(3, 75, 92), // Critical
]

// All 247 suppliers — named first so they surface in lists.
export const SUPPLIERS: Supplier[] = [...named, ...synthetic]

// The 5 named needs-attention suppliers carry change/reason overlays.
export const NEEDS_ATTENTION_IDS = ['SUP-184', 'SUP-091', 'SUP-203', 'SUP-112', 'SUP-104']
