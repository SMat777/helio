// ── Data access layer ─────────────────────────────────────────────────────
// Pure, synchronous accessors over mock data. This module IS the swap boundary:
// in fase 6 the bodies are replaced with Supabase queries behind the same
// signatures, and no screen changes. Screens import only from here.

import { riskBand } from '../risk'
import type { Supplier, ActivityEvent, Ncr, Segment, SpendByKey, SpendBreakdown, Insight } from '../types'
import { NEEDS_ATTENTION_IDS } from './suppliers'
import { supplierList } from '../store/suppliers'
import { ACTIVITY } from './activity'
import { NCR } from './ncr'

export type { Supplier, ActivityEvent, Ncr, Segment } from '../types'
export type { Contract, Contact, SupplierDocument, NcrRow, NcrSeverity, NcrStatus, SpendBreakdown, SpendByKey, Insight, Esg, EsgRating } from '../types'

// Detail-tab + portfolio accessors — same swap boundary as the rest of this module.
export { getContracts } from './contracts'
export { getContacts } from './contacts'
export { getDocuments } from './documents'
export { getActivityForSupplier } from './activity'
export { getNcrsForSupplier, getNcrs } from './ncr'
export { getEsg } from './esg'

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
// Reads the in-memory store so newly added suppliers ripple through every
// derived view (KPIs, bands, spend). The store IS the mock backing.
export function getSuppliers(): Supplier[] {
  return supplierList()
}

export function getSupplier(id: string): Supplier | undefined {
  return getSuppliers().find((s) => s.id === id)
}

// Needs-attention: the named, overlaid suppliers, highest risk first.
export function getNeedsAttention(limit = 5): Supplier[] {
  return getSuppliers().filter((s) => NEEDS_ATTENTION_IDS.includes(s.id))
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
  const all = getSuppliers()
  const bands: BandRow[] = BAND_META.map((b) => ({
    label: b.label,
    range: b.range,
    color: b.color,
    n: all.filter((s) => b.test(s.riskScore)).length,
  }))
  const atRisk = bands.filter((b) => b.label === 'Elevated' || b.label === 'Critical').reduce((s, b) => s + b.n, 0)
  return {
    total: all.length,
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
  const all = getSuppliers()
  return segments.map((segment) => {
    const rows = all.filter((s) => s.segment === segment)
    const spendEur = rows.reduce((s, r) => s + r.spendEur, 0)
    const avgRisk = rows.length ? Math.round(rows.reduce((s, r) => s + r.riskScore, 0) / rows.length) : 0
    return { segment, count: rows.length, spendEur, avgRisk }
  })
}

// Per-category exposure for the dashboard risk radar (top categories by avg risk).
export function getCategoryRisk(limit = 6): CategoryRisk[] {
  const map = new Map<string, number[]>()
  for (const s of getSuppliers()) {
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

// ── Spend ────────────────────────────────────────────────────────────────--
export function getSpendBreakdown(): SpendBreakdown {
  const all = getSuppliers()
  const total = all.reduce((sum, s) => sum + s.spendEur, 0)
  const groupBy = (key: (s: Supplier) => string): SpendByKey[] => {
    const m = new Map<string, number>()
    for (const s of all) m.set(key(s), (m.get(key(s)) ?? 0) + s.spendEur)
    return [...m.entries()]
      .map(([k, eur]) => ({ key: k, eur, pct: Math.round((eur / total) * 100) }))
      .sort((a, b) => b.eur - a.eur)
  }
  const topSuppliers = [...all]
    .sort((a, b) => b.spendEur - a.spendEur)
    .slice(0, 8)
    .map((s) => ({ id: s.id, name: s.name, eur: s.spendEur, spend: s.spend }))
  return {
    totalEur: total,
    ytdEur: 48_200_000,
    budgetEur: 52_000_000,
    byCategory: groupBy((s) => s.category),
    bySegment: groupBy((s) => s.segment),
    topSuppliers,
  }
}

// ── Insights ───────────────────────────────────────────────────────────────
// Rule-based findings derived from the existing views — no new raw data.
export function getInsights(): Insight[] {
  const sum = getRiskSummary()
  const cats = getCategoryRisk(20)
  const seg = getSegmentExposure()
  const critical = sum.bands.find((b) => b.label === 'Critical')?.n ?? 0
  const eurM = (eur: number) => `€${(eur / 1e6).toFixed(1)}M`

  const worstCat = cats[0]
  const strategic = seg.find((e) => e.segment === 'Strategic')
  const bottleneck = seg.find((e) => e.segment === 'Bottleneck')
  const lowRisk = sum.bands.find((b) => b.label === 'Low')?.n ?? 0

  const out: Insight[] = [
    {
      id: 'critical-concentration',
      tone: 'bad',
      title: `${critical} suppliers sit in critical risk`,
      body: 'These carry the highest probability of disruption. Prioritise 8D containment and dual-sourcing before the next cycle.',
      metric: `${sum.atRisk} at risk total`,
    },
  ]
  if (worstCat) {
    out.push({
      id: 'category-risk',
      tone: 'warn',
      title: `${worstCat.category} carries the highest category risk`,
      body: `Average risk ${worstCat.avgRisk} across ${worstCat.count} suppliers — a structural exposure worth a category review.`,
      metric: `avg ${worstCat.avgRisk}`,
    })
  }
  if (strategic) {
    out.push({
      id: 'strategic-spend',
      tone: 'warn',
      title: 'Strategic spend is concentrated',
      body: `${eurM(strategic.spendEur)} flows through ${strategic.count} strategic suppliers — high spend and high risk demand the most oversight.`,
      metric: eurM(strategic.spendEur),
    })
  }
  if (bottleneck) {
    out.push({
      id: 'bottleneck',
      tone: 'warn',
      title: `${bottleneck.count} bottleneck suppliers, low spend but high risk`,
      body: 'Low leverage but disruption-prone. Build buffer stock or qualify alternates rather than chasing price.',
      metric: `avg ${bottleneck.avgRisk}`,
    })
  }
  out.push({
    id: 'single-source',
    tone: 'bad',
    title: 'DS-PKG-104 is single-source for cardboard',
    body: 'One supplier carries 100% of category spend. A single failure stops the line — qualify a second source.',
    metric: '100% of category',
  })
  out.push({
    id: 'low-risk',
    tone: 'good',
    title: `${lowRisk} suppliers are low-risk and stable`,
    body: 'The long tail of the portfolio is healthy — light-touch monitoring is enough, freeing attention for the critical few.',
    metric: `${lowRisk} in Low band`,
  })
  return out
}
