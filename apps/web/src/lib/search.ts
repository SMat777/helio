// Pure search scoring for the command palette. Plain substring/prefix ranking —
// at ~250 items this is faster and far more explainable than a fuzzy-search dep.

export type SearchKind = 'supplier' | 'page'

export type SearchItem = {
  to: string // navigation target
  title: string
  subtitle?: string
  kind: SearchKind
  terms?: string[] // extra searchable tokens (id, category, segment, country)
}

// Score a candidate against a query. 0 = no match; higher = better.
// Title wins over secondary fields; exact > prefix > word-start > substring.
export function scoreItem(query: string, item: SearchItem): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0
  const title = item.title.toLowerCase()

  let score = 0
  if (title === q) score = 1000
  else if (title.startsWith(q)) score = 600
  else if (title.split(/[\s·,.\-/]+/).some((w) => w.startsWith(q))) score = 350
  else if (title.includes(q)) score = 180

  const extra = [item.subtitle, ...(item.terms ?? [])].filter(Boolean).join(' ').toLowerCase()
  if (extra.includes(q)) score += score > 0 ? 12 : 70

  // Nudge shorter titles up so "Apex" beats "Apex Industries Group" on a tie.
  if (score > 0) score += Math.max(0, 36 - title.length)
  return score
}

export function searchItems(query: string, items: SearchItem[], limit = 8): SearchItem[] {
  if (!query.trim()) return []
  return items
    .map((item) => ({ item, score: scoreItem(query, item) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item)
}
