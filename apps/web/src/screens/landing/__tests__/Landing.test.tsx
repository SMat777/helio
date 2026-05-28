// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../../Landing'

describe('Landing', () => {
  test('renders all 7 section testids', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    const ids = [
      'landing-hero',
      'landing-problem',
      'landing-lenses',
      'landing-risk',
      'landing-decisions',
      'landing-cta',
      'landing-byline',
    ]
    const elements = ids.map((id) => screen.getByTestId(id))
    expect(elements).toHaveLength(7)
    elements.forEach((el) => expect(el).toBeInTheDocument())
  })
})
