import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library mounts into the same jsdom document per file; cleanup
// after each test prevents stale renders leaking into the next assertion.
afterEach(() => {
  cleanup()
})

// jsdom 29 doesn't ship matchMedia; stub it so viewport-aware components don't
// crash on import. Defaults to `matches: false` → desktop branch in tests.
// Guarded for the node test env (lib/* tests) where `window` is undefined.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}
