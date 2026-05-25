// Deterministic PRNG seeded from a string key. The same supplier id always
// yields the same mock rows, so detail tabs are stable across reloads and tests.

export function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32 — same generator family as the synthetic supplier fill.
export function seededRng(key: string): () => number {
  let seed = hashStr(key)
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const pickFrom = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)]

export const intBetween = (rng: () => number, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1))

export const isoDate = (d: Date): string => d.toISOString().slice(0, 10)

// Reference "today" — the mock dataset lives in the 2024 design timeframe.
export const NOW = new Date('2024-05-15')

export function addMonths(base: Date, months: number): Date {
  const d = new Date(base)
  d.setMonth(d.getMonth() + months)
  return d
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}
