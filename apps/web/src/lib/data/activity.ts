import type { ActivityEvent } from '../types'

// Activity feed (HANDOFF §6: DV2_ACTIVITY).
export const ACTIVITY: ActivityEvent[] = [
  { day: 'Today', time: '09:12', tone: 'bad', who: 'Heliox Polymers', what: 'risk score rose +18 → 76', detail: 'Quality rate dropped to 87.4% (was 96.1%)' },
  { day: 'Today', time: '08:30', tone: 'warn', who: 'Three contracts', what: 'expire within 30 days', detail: 'BASF · DS-Smith · NorPack' },
  { day: 'Today', time: '07:55', tone: 'good', who: 'Lima Steel S.A.', what: 'moved to Tier 1', detail: 'Scorecard ≥ 88 for 3rd month' },
  { day: 'Yesterday', time: '16:42', tone: 'warn', who: 'Cardboard · NL', what: 'flagged as single-source', detail: 'DS-PKG-104 carries 100% of spend' },
  { day: 'Yesterday', time: '14:10', tone: 'good', who: 'Roche-Chem GmbH', what: 'ESG audit passed', detail: 'Scope 2 emissions verified' },
  { day: 'This week', time: 'Mon', tone: 'bad', who: 'Factory Yeo', what: 'critical NCR opened', detail: '8D required by Jun 4' },
]
