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
    expect(screen.getByText(/three lenses/i)).toBeInTheDocument()
    expect(screen.getByText(/one risk model/i)).toBeInTheDocument()
  })

  test('primary CTA links to /app', () => {
    renderHero()
    const cta = screen.getByRole('link', { name: /open the live demo/i })
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
