import { describe, it, expect } from 'vitest'
import { sparklinePoints, sparklinePath } from './sparkline'

describe('sparklinePoints', () => {
  it('maps the max value to the top and the min to the bottom', () => {
    const pts = sparklinePoints([0, 10], 100, 30, 2)
    expect(pts[0]).toEqual([2, 28])   // min → bottom (h - pad)
    expect(pts[1]).toEqual([98, 2])   // max → top (pad)
  })

  it('spreads x evenly from pad to w - pad', () => {
    const pts = sparklinePoints([5, 5, 5], 100, 30, 2)
    expect(pts[0][0]).toBe(2)
    expect(pts[2][0]).toBe(98)
  })

  it('handles a flat series without dividing by zero', () => {
    const pts = sparklinePoints([7, 7, 7], 100, 30, 2)
    // range falls back to 1, so (v-min)/range = 0 → every point lands on the
    // baseline (h - pad = 28), never NaN. Matches the source formula in tether-primitives.jsx:89.
    expect(pts.every((p) => p[1] === 28)).toBe(true)
  })
})

describe('sparklinePath', () => {
  it('builds an SVG move/line path', () => {
    expect(sparklinePath([[2, 28], [98, 2]])).toBe('M2 28 L 98 2')
  })
})
