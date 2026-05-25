import { describe, it, expect } from 'vitest'
import { scoreItem, searchItems, type SearchItem } from './search'

const items: SearchItem[] = [
  { to: '/suppliers/SUP-184', title: 'Heliox Polymers', subtitle: 'SUP-184 · Specialty Chemicals', kind: 'supplier', terms: ['SUP-184', 'Specialty Chemicals', 'DE'] },
  { to: '/suppliers/SUP-091', title: 'Factory Yeo Ltd.', subtitle: 'SUP-091 · Electronics · Sensors', kind: 'supplier', terms: ['SUP-091', 'Electronics · Sensors', 'CN'] },
  { to: '/suppliers', title: 'Suppliers', subtitle: 'Portfolio', kind: 'page', terms: ['vendors'] },
  { to: '/esg', title: 'ESG', kind: 'page' },
]

describe('scoreItem', () => {
  it('returns 0 for an empty query', () => {
    expect(scoreItem('', items[0])).toBe(0)
  })

  it('ranks exact title above prefix above word-start above substring', () => {
    const exact = scoreItem('esg', items[3])
    const prefix = scoreItem('heli', items[0])
    const word = scoreItem('poly', items[0]) // matches "Polymers" word start
    const sub = scoreItem('lio', items[0]) // "heLIOx" substring only
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(word)
    expect(word).toBeGreaterThan(sub)
  })

  it('matches on secondary terms like supplier id', () => {
    expect(scoreItem('sup-091', items[1])).toBeGreaterThan(0)
  })

  it('does not match unrelated queries', () => {
    expect(scoreItem('zzz', items[0])).toBe(0)
  })
})

describe('searchItems', () => {
  it('returns [] for an empty query', () => {
    expect(searchItems('', items)).toEqual([])
  })

  it('finds a supplier by name', () => {
    const r = searchItems('heliox', items)
    expect(r[0].to).toBe('/suppliers/SUP-184')
  })

  it('finds a supplier by id', () => {
    const r = searchItems('SUP-091', items)
    expect(r[0].to).toBe('/suppliers/SUP-091')
  })

  it('respects the limit', () => {
    expect(searchItems('s', items, 2).length).toBeLessThanOrEqual(2)
  })
})
