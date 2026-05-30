import { describe, it, expect } from 'vitest'
import { getSuppliers, getSupplier, getNeedsAttention, getRiskSummary, getSegmentExposure, getConcentration, getRecommendations } from './index'

describe('supplier dataset', () => {
  it('has 247 suppliers (12 named + 235 synthetic)', () => {
    expect(getSuppliers()).toHaveLength(247)
  })

  it('resolves a named supplier by id', () => {
    expect(getSupplier('SUP-184')?.name).toBe('Heliox Polymers')
    expect(getSupplier('does-not-exist')).toBeUndefined()
  })
})

describe('getRiskSummary', () => {
  it('matches the design band distribution (168 / 61 / 14 / 4)', () => {
    const { total, atRisk, bands } = getRiskSummary(getSuppliers())
    expect(total).toBe(247)
    const byLabel = Object.fromEntries(bands.map((b) => [b.label, b.n]))
    expect(byLabel).toEqual({ Low: 168, Watch: 61, Elevated: 14, Critical: 4 })
    expect(atRisk).toBe(18) // Elevated + Critical
  })
})

describe('getNeedsAttention', () => {
  it('returns the named overlay suppliers, highest risk first', () => {
    const top = getNeedsAttention(getSuppliers())
    expect(top[0].id).toBe('SUP-184') // Heliox, risk 76
    expect(top.every((s) => s.reason)).toBe(true)
  })
})

describe('getSegmentExposure', () => {
  it('covers all four Kraljic segments and sums to the full set', () => {
    const exp = getSegmentExposure(getSuppliers())
    expect(exp.map((e) => e.segment).sort()).toEqual(['Bottleneck', 'Leverage', 'Routine', 'Strategic'])
    expect(exp.reduce((s, e) => s + e.count, 0)).toBe(247)
  })
})

describe('getConcentration', () => {
  it('shows realistic, heavy-tailed spend concentration (not uniform)', () => {
    const c = getConcentration(getSuppliers())
    expect(c.points).toHaveLength(20)
    // A uniform portfolio needs ~80% of suppliers to reach 80% of spend; a
    // realistic one reaches it with far fewer. Guards the seed's skew.
    expect(c.pareto80N).toBeGreaterThan(10)
    expect(c.pareto80N).toBeLessThan(90)
    expect(c.top10Pct).toBeGreaterThan(25)
    expect(c.top5Pct).toBeLessThan(c.top10Pct)
  })

  it('surfaces single-source category exposure', () => {
    const c = getConcentration(getSuppliers())
    expect(c.singleSourceCount).toBeGreaterThan(0)
    expect(c.singleSourceEur).toBeGreaterThan(0)
    expect(c.singleSource.length).toBeGreaterThan(0)
    expect(c.singleSource.length).toBeLessThanOrEqual(5)
  })
})

describe('getRecommendations', () => {
  it('returns a ranked, deduplicated action plan with quantified impact', () => {
    const recs = getRecommendations(getSuppliers())
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.length).toBeLessThanOrEqual(8)
    // ranks are sequential 1..N
    expect(recs.map((r) => r.rank)).toEqual(recs.map((_, i) => i + 1))
    // one move per supplier (aggregate moves have no supplierId)
    const ids = recs.filter((r) => r.supplierId).map((r) => r.supplierId)
    expect(new Set(ids).size).toBe(ids.length)
    // breadth: the plan carries both risk moves and money moves
    expect(recs.some((r) => r.riskDelta > 0)).toBe(true)
    expect(recs.some((r) => r.eurImpact > 0)).toBe(true)
    // the highest-risk critical supplier leads the plan
    expect(recs[0].kind).toBe('dual-source')
  })
})
