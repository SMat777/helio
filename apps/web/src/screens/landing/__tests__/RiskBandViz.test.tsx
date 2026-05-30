// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import RiskBandViz from '../RiskBandViz'

// The risk section is Helio's central thesis ("one risk module"). It is now a
// live playground: a single critical-threshold slider reflows a demo portfolio.
// These assertions guard that the band model stays anchored to lib/risk.ts
// (Elevated 65, Watch 40) and that the live recompute actually fires.
describe('RiskBandViz', () => {
  test('renders all 4 bands with locked labels in fixed order', () => {
    const { container } = render(<RiskBandViz />)
    const ladder = container.querySelector('.risk-ladder')
    expect(ladder).not.toBeNull()
    const labels = Array.from(ladder!.querySelectorAll('.band-label')).map((el) => el.textContent)
    expect(labels).toEqual(['Critical', 'Elevated', 'Watch', 'Low'])
  })

  test('default band ranges are anchored to lib/risk.ts thresholds (75/65/40)', () => {
    render(<RiskBandViz />)
    expect(screen.getByText('≥ 75')).toBeInTheDocument()
    expect(screen.getByText('65–74')).toBeInTheDocument()
    expect(screen.getByText('40–64')).toBeInTheDocument()
    expect(screen.getByText('< 40')).toBeInTheDocument()
  })

  test('light bands (Elevated, Watch) use dark text for WCAG 1.4.3 contrast', () => {
    const { container } = render(<RiskBandViz />)
    const items = Array.from(container.querySelectorAll('.risk-ladder li')) as HTMLElement[]
    const elevated = items.find((li) => li.textContent?.includes('Elevated'))!
    const watch = items.find((li) => li.textContent?.includes('Watch'))!
    // jsdom normalizes #16130f to rgb(22, 19, 15)
    expect(elevated.style.color).toBe('rgb(22, 19, 15)')
    expect(watch.style.color).toBe('rgb(22, 19, 15)')
    const critical = items.find((li) => li.textContent?.includes('Critical'))!
    expect(critical.style.color).toBe('rgb(255, 255, 255)')
  })

  test('renders a critical-threshold slider defaulting to 75', () => {
    render(<RiskBandViz />)
    const slider = screen.getByRole('slider', { name: /critical risk threshold/i }) as HTMLInputElement
    expect(slider.value).toBe('75')
  })

  test('renders one chip per portfolio supplier', () => {
    const { container } = render(<RiskBandViz />)
    expect(container.querySelectorAll('.risk-cloud .risk-chip').length).toBe(24)
  })

  test('lowering the critical line reflows more suppliers into Critical', () => {
    const { container } = render(<RiskBandViz />)
    const criticalCount = () => {
      const counts = Array.from(container.querySelectorAll('.risk-count')) as HTMLElement[]
      const crit = counts.find((c) => within(c).queryByText('Critical'))!
      return Number(crit.querySelector('.risk-count-n')!.textContent)
    }
    const before = criticalCount() // 7 scores ≥ 75
    const slider = screen.getByRole('slider', { name: /critical risk threshold/i })
    fireEvent.change(slider, { target: { value: '66' } })
    const after = criticalCount() // 12 scores ≥ 66
    expect(after).toBeGreaterThan(before)
  })
})
