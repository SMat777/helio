import { describe, it, expect } from 'vitest'
import { fmtMoney, fmtMoneyM } from './format'

describe('fmtMoney', () => {
  it('renders billions with one decimal', () => {
    expect(fmtMoney(1_188_000_000)).toBe('€1.2B')
    expect(fmtMoney(8_100_000_000)).toBe('€8.1B')
  })
  it('renders millions with one decimal', () => {
    expect(fmtMoney(4_200_000)).toBe('€4.2M')
    expect(fmtMoney(900_000_000)).toBe('€900.0M')
  })
  it('rounds thousands to whole k', () => {
    expect(fmtMoney(340_000)).toBe('€340k')
    expect(fmtMoney(8_400)).toBe('€8k')
  })
  it('renders small values with thousands separators', () => {
    expect(fmtMoney(420)).toBe('€420')
    expect(fmtMoney(0)).toBe('€0')
  })
})

describe('fmtMoneyM', () => {
  it('forces millions with one decimal so the unit stays stable', () => {
    expect(fmtMoneyM(48_200_000)).toBe('€48.2M')
    expect(fmtMoneyM(400_000)).toBe('€0.4M')
  })
})
