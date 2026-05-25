import type { ActivityEvent } from '../types'
import { SUPPLIERS } from './suppliers'
import { seededRng, pickFrom, intBetween } from './seed'

// Activity feed (HANDOFF §6: DV2_ACTIVITY).
export const ACTIVITY: ActivityEvent[] = [
  { day: 'Today', time: '09:12', tone: 'bad', who: 'Heliox Polymers', what: 'risk score rose +18 → 76', detail: 'Quality rate dropped to 87.4% (was 96.1%)' },
  { day: 'Today', time: '08:30', tone: 'warn', who: 'Three contracts', what: 'expire within 30 days', detail: 'BASF · DS-Smith · NorPack' },
  { day: 'Today', time: '07:55', tone: 'good', who: 'Lima Steel S.A.', what: 'moved to Tier 1', detail: 'Scorecard ≥ 88 for 3rd month' },
  { day: 'Yesterday', time: '16:42', tone: 'warn', who: 'Cardboard · NL', what: 'flagged as single-source', detail: 'DS-PKG-104 carries 100% of spend' },
  { day: 'Yesterday', time: '14:10', tone: 'good', who: 'Roche-Chem GmbH', what: 'ESG audit passed', detail: 'Scope 2 emissions verified' },
  { day: 'This week', time: 'Mon', tone: 'bad', who: 'Factory Yeo', what: 'critical NCR opened', detail: '8D required by Jun 4' },
]

// ── Per-supplier activity (detail tab) ───────────────────────────────────────
const WHEN = ['Today', 'Yesterday', 'This week', 'Last week', '2 weeks ago', 'This month']

export function getActivityForSupplier(supplierId: string): ActivityEvent[] {
  const s = SUPPLIERS.find((x) => x.id === supplierId)
  if (!s) return []
  const rng = seededRng(`activity:${s.id}`)
  const up = s.riskScore >= 65
  const events: ActivityEvent[] = []

  events.push({
    day: 'Today',
    time: `${intBetween(rng, 8, 17)}:${String(intBetween(rng, 0, 59)).padStart(2, '0')}`,
    tone: up ? 'bad' : 'good',
    who: s.name,
    what: up ? `risk score rose to ${s.riskScore}` : `risk score steady at ${s.riskScore}`,
    detail: s.reason ?? `On-time ${s.onTimePct}% · quality ${s.qualityPct}/100`,
  })
  if (s.ncrs > 0) {
    events.push({
      day: 'This week', time: pickFrom(rng, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
      tone: 'bad', who: s.name, what: `${s.ncrs} open NCR${s.ncrs === 1 ? '' : 's'}`,
      detail: 'Awaiting 8D containment',
    })
  }
  events.push({
    day: pickFrom(rng, WHEN), time: pickFrom(rng, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
    tone: s.onTimePct >= 95 ? 'good' : 'warn', who: 'Delivery', what: `on-time at ${s.onTimePct}%`,
    detail: s.onTimePct >= 95 ? 'On target' : 'Below 95% target',
  })
  events.push({
    day: pickFrom(rng, WHEN), time: pickFrom(rng, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
    tone: s.scorecard >= 80 ? 'good' : 'warn', who: 'Scorecard', what: `composite ${s.scorecard}/100`,
    detail: `Tier ${s.tier} · ${s.segment}`,
  })
  events.push({
    day: 'This month', time: pickFrom(rng, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
    tone: 'good', who: 'ESG', what: rng() > 0.5 ? 'audit passed' : 'review scheduled',
    detail: 'Scope 2 emissions',
  })
  return events
}
