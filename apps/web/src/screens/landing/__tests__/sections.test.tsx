// @vitest-environment jsdom
// Smoke-tests for the section components that aren't covered by dedicated suites.
// Each test verifies the section's heading + its primary semantic contract.
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Problem from '../Problem'
import Decisions from '../Decisions'
import Cta from '../Cta'
import Byline from '../Byline'

describe('Problem', () => {
  test('renders 3 pillars with locked headings', () => {
    render(<Problem />)
    expect(screen.getByRole('heading', { name: /the procurement problem/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /spreadsheet sprawl/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /risk hides in single numbers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /esg bolted on/i })).toBeInTheDocument()
  })
})

describe('Decisions', () => {
  test('renders 5 decision rows as disclosure widgets (desktop = open, mobile = accordion)', () => {
    const { container } = render(<Decisions />)
    expect(screen.getByRole('heading', { name: /five decisions/i })).toBeInTheDocument()
    const rows = container.querySelectorAll('details.dec-row')
    expect(rows).toHaveLength(5)
    // Desktop default (jsdom matchMedia returns false): rows render open.
    // Mobile flips the `open` attribute off via the matchMedia effect.
    rows.forEach((row) => expect(row).toHaveAttribute('open'))
    const titles = Array.from(container.querySelectorAll('summary.dec-title')).map((s) => s.textContent)
    expect(titles).toEqual([
      'Mock-first, swap later',
      'One risk module',
      'Pure derivations',
      'Semantic CSS tokens',
      'Lazy backend',
    ])
  })
})

describe('Cta', () => {
  test('primary CTA targets /app, secondary opens repo in new tab', () => {
    render(<MemoryRouter><Cta /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /the demo runs on 247 suppliers/i })).toBeInTheDocument()
    const primary = screen.getByRole('link', { name: /open the live demo/i })
    expect(primary).toHaveAttribute('href', '/app')
    const secondary = screen.getByRole('link', { name: /see the code on github/i })
    expect(secondary).toHaveAttribute('href', expect.stringContaining('github.com/SMat777/helio'))
    expect(secondary).toHaveAttribute('target', '_blank')
    expect(secondary).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})

describe('Byline', () => {
  test('renders attribution + github and linkedin links with safe rel', () => {
    render(<Byline />)
    expect(screen.getByRole('heading', { name: /about this build/i })).toBeInTheDocument()
    const github = screen.getByRole('link', { name: /github\.com\/smat777/i })
    expect(github).toHaveAttribute('href', 'https://github.com/SMat777')
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'))
    const linkedin = screen.getByRole('link', { name: /linkedin\.com\/in\/simonmathiasen-dev/i })
    expect(linkedin).toHaveAttribute('href', expect.stringContaining('linkedin.com'))
  })
})
