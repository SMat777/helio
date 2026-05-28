import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { Pill } from './Pill'
import { CommandPalette } from './CommandPalette'
import { ActivityFeed } from './ActivityFeed'
import { getActivity } from '../lib/data'

type NavItem = { label: string; to: string; icon: IconName; trail?: string; warn?: number; bad?: number; end?: boolean }
type NavGroup = { section: string; items: NavItem[] }

// Nav model (kilde: DV3Sidebar). Routes the screens live at.
const NAV: NavGroup[] = [
  {
    section: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/app', icon: 'grid', end: true },
      { label: 'Suppliers', to: '/app/suppliers', icon: 'building', trail: '247' },
      { label: 'Categories', to: '/app/categories', icon: 'folder' },
      { label: 'Contracts', to: '/app/contracts', icon: 'doc', warn: 9 },
      { label: 'NCRs', to: '/app/ncrs', icon: 'warn', bad: 3 },
      { label: 'Insights', to: '/app/insights', icon: 'sparkle' },
    ],
  },
  {
    section: 'Reports',
    items: [
      { label: 'Scorecards', to: '/app/scorecards', icon: 'chart' },
      { label: 'ESG', to: '/app/esg', icon: 'chart' },
      { label: 'Spend', to: '/app/spend', icon: 'chart' },
    ],
  },
]

function Sidebar() {
  return (
    <aside className="flex h-screen flex-col border-r border-line bg-sidebar">
      <div className="flex items-center gap-2.5 px-4 pt-[18px] pb-3">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-ink font-mono text-[12px] font-semibold text-white">h</span>
        <span className="font-serif text-[20px] leading-none tracking-[-0.02em]">helio</span>
        <span className="ml-auto font-mono text-[10px] tracking-[0.05em] text-ink-3">v0.3</span>
      </div>
      <nav className="flex flex-1 flex-col gap-px px-2 py-1">
        {NAV.map((g) => (
          <div key={g.section} className="contents">
            <div className="px-2.5 pt-3.5 pb-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{g.section}</div>
            {g.items.map((it) => (
              <NavLink
                key={it.label}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[13.5px] font-medium no-underline ${
                    isActive ? 'bg-card text-ink shadow-[0_1px_0_var(--line)]' : 'text-ink-2 hover:bg-hover hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={it.icon} style={{ opacity: isActive ? 1 : 0.7, color: isActive ? 'var(--accent)' : undefined }} />
                    <span className="flex-1">{it.label}</span>
                    {it.trail && <span className="font-mono text-[10.5px] text-ink-3">{it.trail}</span>}
                    {it.warn != null && <Pill tone="warn">{it.warn}</Pill>}
                    {it.bad != null && <Pill tone="bad">{it.bad}</Pill>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-line px-4 py-3.5">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent font-mono text-[11px] font-semibold text-white">SM</span>
        <div>
          <div className="text-[12.5px] font-medium">Simon M.</div>
          <div className="text-[11px] text-ink-3">Procurement Lead</div>
        </div>
      </div>
    </aside>
  )
}

// Bell with a popover of recent activity (kilde: DV2 activity feed).
function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const items = getActivity(6).map((e) => ({
    tone: e.tone,
    who: e.who,
    what: e.what,
    detail: e.detail,
    time: `${e.day} · ${e.time}`,
  }))
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative cursor-pointer rounded-md border border-transparent px-1.5 py-1.5 text-ink-2 hover:bg-hover hover:text-ink"
      >
        <Icon name="bell" />
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-bad" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-xl border border-line bg-card shadow-[0_16px_44px_-12px_rgba(40,30,20,0.28)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
              <span>Notifications</span>
              <span>last 24h</span>
            </div>
            <div className="max-h-[360px] overflow-auto px-4 py-1">
              <ActivityFeed items={items} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Topbar({ crumb, actions, slim = false, onOpenSearch }: { crumb?: ReactNode; actions?: ReactNode; slim?: boolean; onOpenSearch: () => void }) {
  return (
    <div className={`flex items-center justify-between border-b border-line bg-paper ${slim ? 'px-7 py-2.5' : 'px-8 py-3.5'}`}>
      <div className="font-mono text-[11px] tracking-[0.04em] text-ink-3">{crumb}</div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSearch}
          className="relative w-[220px] cursor-pointer rounded-[7px] border border-line bg-card py-[5px] pr-2.5 pl-7 text-left font-mono text-[12.5px] text-ink-3 hover:bg-hover hover:text-ink"
        >
          <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          Search…
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[3px] border border-line bg-paper px-1.5 py-px font-mono text-[10px]">⌘K</span>
        </button>
        {actions}
        <NotificationsBell />
      </div>
    </div>
  )
}

// App chrome wrapper: fixed sidebar + topbar, scrollable content (kilde: .t-shell).
export function AppShell({ crumb, actions, slim = false, children }: {
  crumb?: ReactNode
  actions?: ReactNode
  slim?: boolean
  children: ReactNode
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  // Global launcher: ⌘K / Ctrl+K anywhere, "/" when not typing in a field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="grid h-screen grid-cols-[224px_1fr]">
      <Sidebar />
      <div className="flex min-w-0 flex-col overflow-hidden">
        <Topbar crumb={crumb} actions={actions} slim={slim} onOpenSearch={() => setSearchOpen(true)} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
