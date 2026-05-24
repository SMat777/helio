// Stroke-only line icons, 16×16 viewBox (kilde: Icon i tether-primitives.jsx).
import type { CSSProperties } from 'react'

export type IconName =
  | 'grid' | 'building' | 'folder' | 'doc' | 'warn' | 'sparkle' | 'chart'
  | 'cog' | 'users' | 'bell' | 'arrowUp' | 'arrowDown' | 'flat' | 'plus'
  | 'filter' | 'sort' | 'dots' | 'export' | 'search' | 'back' | 'check'

const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const paths: Record<IconName, React.ReactNode> = {
  grid: <g {...s}><rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" /><rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" /></g>,
  building: <g {...s}><rect x="3" y="2" width="10" height="12" /><line x1="6" y1="5" x2="6" y2="5" /><line x1="10" y1="5" x2="10" y2="5" /><line x1="6" y1="8" x2="6" y2="8" /><line x1="10" y1="8" x2="10" y2="8" /><line x1="6" y1="14" x2="6" y2="11" /><line x1="10" y1="14" x2="10" y2="11" /></g>,
  folder: <g {...s}><path d="M2 5v8a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3.5H3a1 1 0 00-1 1V5z" /></g>,
  doc: <g {...s}><path d="M4 2h6l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M10 2v3h3" /></g>,
  warn: <g {...s}><path d="M8 2l6 11H2L8 2z" /><line x1="8" y1="7" x2="8" y2="10" /><line x1="8" y1="12" x2="8" y2="12" /></g>,
  sparkle: <g {...s}><path d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z" /></g>,
  chart: <g {...s}><line x1="3" y1="13" x2="13" y2="13" /><rect x="4" y="8" width="2" height="5" /><rect x="7" y="5" width="2" height="8" /><rect x="10" y="9" width="2" height="4" /></g>,
  cog: <g {...s}><circle cx="8" cy="8" r="2.2" /><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" /></g>,
  users: <g {...s}><circle cx="6" cy="6" r="2.2" /><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" /><path d="M11 4.5a2 2 0 010 4M14 13c0-1.8-1.2-3.3-3-3.8" /></g>,
  bell: <g {...s}><path d="M4 12V8a4 4 0 018 0v4l1.5 1.5h-11L4 12z" /><path d="M7 14a1 1 0 002 0" /></g>,
  arrowUp: <g {...s}><path d="M8 12V4M4 7l4-3 4 3" /></g>,
  arrowDown: <g {...s}><path d="M8 4v8M4 9l4 3 4-3" /></g>,
  flat: <g {...s}><path d="M3 8h10" /></g>,
  plus: <g {...s}><path d="M8 3v10M3 8h10" /></g>,
  filter: <g {...s}><path d="M2 3h12l-4.5 6v4l-3 1.5V9L2 3z" /></g>,
  sort: <g {...s}><path d="M5 3v10M3 11l2 2 2-2M11 13V3M9 5l2-2 2 2" /></g>,
  dots: <g {...s}><circle cx="3.5" cy="8" r=".5" /><circle cx="8" cy="8" r=".5" /><circle cx="12.5" cy="8" r=".5" /></g>,
  export: <g {...s}><path d="M8 2v8M5 6l3-3 3 3" /><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" /></g>,
  search: <g {...s}><circle cx="7" cy="7" r="4.2" /><path d="M10 10l3.5 3.5" /></g>,
  back: <g {...s}><path d="M10 3L5 8l5 5" /></g>,
  check: <g {...s}><path d="M3 8.5l3.5 3.5L13 4" /></g>,
}

export function Icon({ name, size = 14, className = '', style }: {
  name: IconName
  size?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flex: '0 0 auto', ...style }}
    >
      {paths[name]}
    </svg>
  )
}
