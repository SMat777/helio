// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Hero from '../Hero'

function renderHero() {
  return render(<MemoryRouter><Hero /></MemoryRouter>)
}

describe('Hero', () => {
  test('renders the README-mirror headline', () => {
    renderHero()
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(/three lenses/i)
    expect(h1).toHaveTextContent(/one risk model/i)
  })

  test('primary CTA links to /app', () => {
    renderHero()
    // Exact accessible-name match — nav-CTA's aria-label is "Open the live demo"
    // (without arrow), so this only matches the primary in-hero CTA.
    const cta = screen.getByRole('link', { name: 'Open the live demo →' })
    expect(cta).toHaveAttribute('href', '/app')
  })

  test('secondary CTA links to GitHub repo', () => {
    renderHero()
    const code = screen.getByRole('link', { name: /see the code/i })
    expect(code).toHaveAttribute('href', expect.stringContaining('github.com/SMat777/helio'))
  })

  test('renders trust line with test count and seed size', () => {
    renderHero()
    expect(screen.getByText(/29 of 29 tests/i)).toBeInTheDocument()
    expect(screen.getByText(/247-supplier seed/i)).toBeInTheDocument()
  })
})
