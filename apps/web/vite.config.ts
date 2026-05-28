/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// React + Tailwind v4 Vite plugin. Vitest default env is node; component tests
// opt into jsdom per-file with `// @vitest-environment jsdom` at the top.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
  },
})
