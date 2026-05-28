// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LensTabs from '../LensTabs'

describe('LensTabs', () => {
  test('starts on matrix tab', () => {
    render(<LensTabs />)
    expect(screen.getByRole('img', { name: /kraljic matrix/i })).toBeInTheDocument()
    expect(screen.getByText(/where does structural risk concentrate/i)).toBeInTheDocument()
  })

  test('switches to table tab on click', () => {
    render(<LensTabs />)
    fireEvent.click(screen.getByRole('tab', { name: /sortable table/i }))
    expect(screen.getByText(/which suppliers need attention this week/i)).toBeInTheDocument()
  })

  test('switches to cards tab on click', () => {
    render(<LensTabs />)
    fireEvent.click(screen.getByRole('tab', { name: /visual cards/i }))
    expect(screen.getByText(/quick visual triage by category/i)).toBeInTheDocument()
  })

  // Keyboard nav follows ARIA Authoring Practices § Tabs Pattern.
  // aria-selected is the source of truth — assert state, not just visible text.
  test('ArrowRight moves selection to the next tab', () => {
    render(<LensTabs />)
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: /sortable table/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /kraljic matrix/i })).toHaveAttribute('aria-selected', 'false')
  })

  test('End jumps to the last tab (cards)', () => {
    render(<LensTabs />)
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(screen.getByRole('tab', { name: /visual cards/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('ArrowLeft from first tab wraps to last (cards)', () => {
    render(<LensTabs />)
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(screen.getByRole('tab', { name: /visual cards/i })).toHaveAttribute('aria-selected', 'true')
  })
})
