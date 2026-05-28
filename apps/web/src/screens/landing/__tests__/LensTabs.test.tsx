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
})
