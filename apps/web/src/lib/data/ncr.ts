import type { Ncr } from '../types'

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
