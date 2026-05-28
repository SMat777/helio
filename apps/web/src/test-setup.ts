import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library mounts into the same jsdom document per file; cleanup
// after each test prevents stale renders leaking into the next assertion.
afterEach(() => {
  cleanup()
})
