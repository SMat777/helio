// ── Data access layer ─────────────────────────────────────────────────────
// Pure, synchronous accessors over mock data. This module IS the swap boundary:
// in fase 6 the bodies are replaced with Supabase queries behind the same
// signatures, and no screen changes. Screens import only from here.

import { riskBand } from '../risk'
import type { Supplier, ActivityEvent, Ncr, Segment } from '../types'
import { SUPPLIERS, NEEDS_ATTENTION_IDS } from './suppliers'
import { ACTIVITY } from './activity'
import { NCR } from './ncr'

export type { Supplier, ActivityEvent, Ncr, Segment } from '../types'

export type Kpi = {
  label: string
  value: string
  unit?: string
  delta: string
  dir: 'up' | 'down' | 'flat'
  note: string
}

export type BandRow = { label: string; range: string; n: number; color: string }

export type RiskSummary = {
  total: number
  atRisk: number
  bands: BandRow[]
  spendYtdEur: number
}

export type SegmentExposure = {
  segment: Segment
  count: number
  spendEur: number
  avgRisk: number
}

export type CategoryRisk = { category: string; count: number; avgRisk: number; pct: number }

// ── Suppliers ──────────────────────────────────────────────────────────────
export function getSuppliers(): Supplier[] {
  return SUPPLIERS
}

export function getSupplier(id: string): Supplier | undefined {
  return SUPPLIERS.find((s) => s.id === id)
}

// Needs-attention: the named, overlaid suppliers, highest risk first.
export function getNeedsAttention(limit = 5): Supplier[] {
  return SUPPLIERS.filter((s) => NEEDS_ATTENTION_IDS.includes(s.id))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit)
}

// ── Derived views ────────────────────────────────────────────────────────--
const BAND_META: { label: BandRow['label']; range: string; color: string; test: (n: number) => boolean }[] = [
  { label: 'Low', range: '0–40', color: 'var(--good)', test: (n) => riskBand(n) === 'Low' },
  { label: 'Watch', range: '40–65', color: 'var(--ink-4)', test: (n) => riskBand(n) === 'Watch' },
  { label: 'Elevated', range: '65–75', color: 'var(--warn)', test: (n) => riskBand(n) === 'Elevated' },
  { label: 'Critical', range: '75+', color: 'var(--bad)', test: (n) => riskBand(n) === 'Critical' },
]

export function getRiskSummary(): RiskSummary {
  const bands: BandRow[] = BAND_META.map((b) => ({
    label: b.label,
    range: b.range,
    color: b.color,
    n: SUPPLIERS.filter((s) => b.test(s.riskScore)).length,
  }))
  const atRisk = bands.filter((b) => b.label === 'Elevated' || b.label === 'Critical').reduce((s, b) => s + b.n, 0)
  return {
    total: SUPPLIERS.length,
    atRisk,
    bands,
    spendYtdEur: 48_200_000, // budget-tracked YTD spend (design figure, not the sum of supplier columns)
  }
}

export function getKpis(): Kpi[] {
  const sum = getRiskSummary()
  const ncr = getNcrSummary()
  return [
    { label: 'Active suppliers', value: String(sum.total), delta: '+12', dir: 'up', note: 'vs. last quarter' },
    { label: 'At-risk', value: String(sum.atRisk), delta: '+4', dir: 'down', note: 'needs attention' },
    { label: 'Open NCRs', value: String(ncr.open), delta: '+6', dir: 'down', note: `${ncr.critical} critical · ${ncr.dueThisWeek} due this week` },
    { label: 'Spend YTD', value: '48.2', unit: 'M€', delta: '+8.4%', dir: 'up', note: 'vs. budget' },
  ]
}

export function getSegmentExposure(): SegmentExposure[] {
  const segments: Segment[] = ['Strategic', 'Bottleneck', 'Leverage', 'Routine']
  return segments.map((segment) => {
    const rows = SUPPLIERS.filter((s) => s.segment === segment)
    const spendEur = rows.reduce((s, r) => s + r.spendEur, 0)
    const avgRisk = rows.length ? Math.round(rows.reduce((s, r) => s + r.riskScore, 0) / rows.length) : 0
    return { segment, count: rows.length, spendEur, avgRisk }
  })
}

// Per-category exposure for the dashboard risk radar (top categories by avg risk).
export function getCategoryRisk(limit = 6): CategoryRisk[] {
  const map = new Map<string, number[]>()
  for (const s of SUPPLIERS) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category)!.push(s.riskScore)
  }
  return [...map.entries()]
    .map(([category, scores]) => ({
      category,
      count: scores.length,
      avgRisk: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      pct: 0,
    }))
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, limit)
    .map((r) => ({ ...r, pct: r.avgRisk }))
}

// ── Activity / NCR ───────────────────────────────────────────────────────--
export function getActivity(limit = 6): ActivityEvent[] {
  return ACTIVITY.slice(0, limit)
}

export function getNcr(): Ncr {
  return NCR
}

export function getNcrSummary(): { open: number; critical: number; dueThisWeek: number } {
  return { open: 23, critical: 5, dueThisWeek: 3 }
}
