// Domain types — mirror the Supabase schema (HANDOFF §5) but only the fields the UI reads.

export type Segment = 'Strategic' | 'Bottleneck' | 'Leverage' | 'Routine'
export type Tier = 1 | 2 | 3

export type Supplier = {
  id: string            // "SUP-184"
  name: string          // "Heliox Polymers"
  country: string       // ISO-2 "DE"
  category: string      // "Specialty Chemicals"
  segment: Segment
  tier: Tier
  scorecard: number     // 0..100 composite
  riskScore: number     // 0..100
  onTimePct: number     // e.g. 87.4
  qualityPct: number    // e.g. 88
  ncrs: number          // open NCR count
  spend: string         // display "€2.1M"
  spendEur: number      // numeric, for sums/sorting
  trend: number[]       // ~12 risk-history points (90d downsampled)
  change?: string       // 30d risk delta, e.g. "+18" (needs-attention overlay)
  reason?: string       // short human reason, e.g. "Quality −8.7pp"
}

export type Tone = 'good' | 'warn' | 'bad'

export type ActivityEvent = {
  day: string           // "Today" | "Yesterday" | "This week"
  time: string          // "09:12" | "Mon"
  tone: Tone
  who: string
  what: string
  detail?: string
}

export type NcrSection = {
  n: number
  title: string
  body?: string
  placeholder?: string
}

export type NcrSeverity = 'critical' | 'major' | 'minor'
export type NcrStatus = 'draft' | 'open' | '8d' | 'closed'

export type Ncr = {
  id: string            // "NCR-2024-0312"
  supplierId: string
  supplierName: string
  country: string
  segment: Segment
  severity: NcrSeverity
  status: NcrStatus
  openedAt: string
  dueAt: string
  dPhase: string        // "D4"
  costImpactEur: number
  sections: NcrSection[]
}

// Lightweight NCR row for lists (supplier detail tab + portfolio NCR list).
export type NcrRow = {
  id: string
  supplierId: string
  title: string
  severity: NcrSeverity
  status: NcrStatus
  openedAt: string
  dueAt: string
  costImpactEur: number
}

export type Contract = {
  id: string            // "CT-184-1"
  supplierId: string
  title: string
  type: 'Supply' | 'Framework' | 'Quality' | 'Logistics' | 'NDA'
  valueEur: number
  start: string         // ISO yyyy-mm-dd
  end: string
  status: 'active' | 'expiring' | 'expired' | 'draft'
}

export type Contact = {
  supplierId: string
  name: string
  role: string
  email: string
  phone: string
  primary?: boolean
}

// Named SupplierDocument to avoid clashing with the DOM `Document` type.
export type SupplierDocument = {
  supplierId: string
  name: string
  fileType: 'PDF' | 'XLSX' | 'DOCX' | 'CSV'
  category: string
  date: string
  sizeKb: number
}
