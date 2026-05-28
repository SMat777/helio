import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { getSuppliers } from '../lib/data'
import { searchItems, type SearchItem } from '../lib/search'

// Static destinations — mirror the sidebar routes (kilde: AppShell NAV).
const PAGES: SearchItem[] = [
  { to: '/app', title: 'Dashboard', subtitle: 'Workspace overview', kind: 'page', terms: ['home'] },
  { to: '/app/suppliers', title: 'Suppliers', subtitle: 'Portfolio · Kraljic matrix', kind: 'page', terms: ['vendors', 'matrix'] },
  { to: '/app/categories', title: 'Categories', subtitle: 'Spend categories', kind: 'page' },
  { to: '/app/contracts', title: 'Contracts', subtitle: 'Agreements', kind: 'page' },
  { to: '/app/ncr/new', title: 'NCRs', subtitle: 'Non-conformance reports', kind: 'page', terms: ['quality', 'ncr'] },
  { to: '/app/insights', title: 'Insights', subtitle: 'Portfolio findings', kind: 'page' },
  { to: '/app/scorecards', title: 'Scorecards', subtitle: 'Supplier scoring', kind: 'page' },
  { to: '/app/esg', title: 'ESG', subtitle: 'Environmental · Social · Governance', kind: 'page' },
  { to: '/app/spend', title: 'Spend', subtitle: 'Spend analysis', kind: 'page' },
]

// Mounted only while open (AppShell gates it), so state starts fresh each time —
// no reset effects needed.
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  // Built once — supplier list is stable for the session.
  const items = useMemo<SearchItem[]>(() => {
    const suppliers: SearchItem[] = getSuppliers().map((s) => ({
      to: `/app/suppliers/${s.id}`,
      title: s.name,
      subtitle: `${s.id} · ${s.category}`,
      kind: 'supplier',
      terms: [s.id, s.category, s.segment, s.country],
    }))
    return [...PAGES, ...suppliers]
  }, [])

  // Empty query shows the top destinations as a launcher; otherwise ranked matches.
  const results = useMemo<SearchItem[]>(
    () => (query.trim() ? searchItems(query, items, 8) : PAGES.slice(0, 6)),
    [query, items],
  )

  function select(item?: SearchItem) {
    const target = item ?? results[active]
    if (!target) return
    navigate(target.to)
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation() // keep App-level Esc→home from also firing
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" onMouseDown={onClose}>
      <div className="absolute inset-0" style={{ background: 'color-mix(in oklab, var(--ink) 16%, transparent)' }} />
      <div
        className="relative mt-[12vh] w-[min(560px,92vw)] overflow-hidden rounded-xl border border-line bg-card shadow-[0_24px_60px_-12px_rgba(40,30,20,0.28)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-3">
          <Icon name="search" size={15} className="text-ink-3" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search suppliers, pages…"
            className="w-full bg-transparent font-sans text-[14px] text-ink outline-none placeholder:text-ink-4"
          />
          <span className="rounded-[4px] border border-line bg-paper px-1.5 py-px font-mono text-[10px] text-ink-3">Esc</span>
        </div>

        {/* Results */}
        <div className="max-h-[52vh] overflow-auto py-1.5">
          {results.length === 0 ? (
            <div className="px-4 py-9 text-center font-mono text-[12px] text-ink-3">
              No matches for “{query}”
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.kind}:${r.to}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(r)}
                className={`flex w-full items-center gap-3 px-3.5 py-2 text-left ${i === active ? 'bg-hover' : ''}`}
              >
                <span className={`grid h-7 w-7 flex-none place-items-center rounded-md border border-line text-ink-3 ${i === active ? 'bg-card' : 'bg-paper-2'}`}>
                  <Icon name={r.kind === 'supplier' ? 'building' : 'grid'} size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-ink">{r.title}</span>
                  {r.subtitle && <span className="block truncate font-mono text-[11px] text-ink-3">{r.subtitle}</span>}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-4">
                  {r.kind === 'supplier' ? 'Supplier' : 'Page'}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-line bg-paper-2 px-3.5 py-2 font-mono text-[10.5px] text-ink-3">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  )
}
