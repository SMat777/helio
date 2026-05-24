import { describe, it, expect } from 'vitest'
import { riskBand, riskColor } from './risk'

describe('riskBand', () => {
  it('classifies band boundaries per HANDOFF §7', () => {
    expect(riskBand(0)).toBe('Low')
    expect(riskBand(39)).toBe('Low')
    expect(riskBand(40)).toBe('Watch')
    expect(riskBand(64)).toBe('Watch')
    expect(riskBand(65)).toBe('Elevated')
    expect(riskBand(74)).toBe('Elevated')
    expect(riskBand(75)).toBe('Critical')
    expect(riskBand(100)).toBe('Critical')
  })
})

describe('riskColor', () => {
  it('picks colour token per HANDOFF §3', () => {
    expect(riskColor(64)).toBe('var(--good)')
    expect(riskColor(65)).toBe('var(--warn)')
    expect(riskColor(74)).toBe('var(--warn)')
    expect(riskColor(75)).toBe('var(--bad)')
  })
})
