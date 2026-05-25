import { describe, it, expect } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('joins headers and rows with newlines and commas', () => {
    const csv = toCsv(['a', 'b'], [[1, 2], [3, 4]])
    expect(csv).toBe('a,b\n1,2\n3,4')
  })

  it('quotes cells containing commas', () => {
    expect(toCsv(['x'], [['Logistics, EU']])).toBe('x\n"Logistics, EU"')
  })

  it('escapes embedded quotes by doubling them', () => {
    expect(toCsv(['x'], [['say "hi"']])).toBe('x\n"say ""hi"""')
  })

  it('quotes cells containing newlines', () => {
    expect(toCsv(['x'], [['line1\nline2']])).toBe('x\n"line1\nline2"')
  })

  it('leaves plain cells unquoted', () => {
    expect(toCsv(['id', 'n'], [['SUP-184', 76]])).toBe('id,n\nSUP-184,76')
  })
})
