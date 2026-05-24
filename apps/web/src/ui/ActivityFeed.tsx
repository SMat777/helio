import type { ReactNode } from 'react'

export type FeedTone = 'good' | 'warn' | 'bad' | 'muted'

const dotColor: Record<FeedTone, string> = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  muted: 'bg-ink-4',
}

export type FeedItem = {
  tone?: FeedTone
  who: ReactNode
  what: ReactNode
  detail?: ReactNode
  time: ReactNode
}

// Activity feed: dot · message · time (kilde: .t-feed / .t-feed-item).
export function ActivityFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-[14px_1fr_auto] items-start gap-2.5 border-b border-line-2 py-2.5 last:border-b-0"
        >
          <span className={`mt-1.5 h-2 w-2 rounded-full ${dotColor[it.tone ?? 'muted']}`} />
          <div className="text-[12.5px] leading-[1.45] text-ink">
            <b className="font-semibold">{it.who}</b> — {it.what}
            {it.detail && <small className="mt-0.5 block text-[11.5px] text-ink-3">{it.detail}</small>}
          </div>
          <span className="whitespace-nowrap font-mono text-[10.5px] text-ink-3">{it.time}</span>
        </div>
      ))}
    </div>
  )
}
