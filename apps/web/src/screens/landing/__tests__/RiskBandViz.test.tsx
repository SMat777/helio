// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RiskBandViz from '../RiskBandViz'

// Band labels + ranges are part of Helio's central thesis ("one risk module").
// These assertions guard against drift between the landing page and lib/risk.ts
// thresholds (40 / 65 / 75). If lib/risk.ts moves a threshold, this test should
// be updated in the same PR — failing here means the marketing claim diverges
// from the actual behavior.
describe('RiskBandViz', () => {
  test('renders all 4 bands with locked labels in fixed order', () => {
    const { container } = render(<RiskBandViz />)
    const ladder = container.querySelector('.risk-ladder')
    expect(ladder).not.toBeNull()
    const labels = Array.from(ladder!.querySelectorAll('.band-label')).map((el) => el.textContent)
    expect(labels).toEqual(['Critical', 'Elevated', 'Watch', 'Low'])
  })

  test('renders band ranges anchored to lib/risk.ts thresholds (40/65/75)', () => {
    render(<RiskBandViz />)
    expect(screen.getByText('> 75')).toBeInTheDocument()
    expect(screen.getByText('66–75')).toBeInTheDocument()
    expect(screen.getByText('41–65')).toBeInTheDocument()
    expect(screen.getByText('≤ 40')).toBeInTheDocument()
  })

  test('light bands (Elevated, Watch) use dark text for WCAG 1.4.3 contrast', () => {
    const { container } = render(<RiskBandViz />)
    const items = Array.from(container.querySelectorAll('.risk-ladder li')) as HTMLElement[]
    const elevated = items.find((li) => li.textContent?.includes('Elevated'))!
    const watch = items.find((li) => li.textContent?.includes('Watch'))!
    // jsdom normalizes #16130f to rgb(22, 19, 15)
    expect(elevated.style.color).toBe('rgb(22, 19, 15)')
    expect(watch.style.color).toBe('rgb(22, 19, 15)')
    // Critical + Low should keep white
    const critical = items.find((li) => li.textContent?.includes('Critical'))!
    expect(critical.style.color).toBe('rgb(255, 255, 255)')
  })

  test('renders 4 touchpoint images with descriptive alt text', () => {
    render(<RiskBandViz />)
    expect(screen.getByAltText(/kraljic matrix tile/i)).toBeInTheDocument()
    expect(screen.getByAltText(/table row with risk-band badge/i)).toBeInTheDocument()
    expect(screen.getByAltText(/chart with risk-band axis/i)).toBeInTheDocument()
    expect(screen.getByAltText(/supplier detail page header/i)).toBeInTheDocument()
  })
})
