import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

// Styled table primitives (kilde: .t-table) — sticky head, hover rows, mono id/num cells.

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <table className={`w-full border-collapse text-[13px] ${className}`}>{children}</table>
}

export function THead({ children, sticky = true }: { children: ReactNode; sticky?: boolean }) {
  return <thead className={sticky ? 'sticky top-0 z-[1]' : ''}>{children}</thead>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function Tr({ children, onClick, className = '' }: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr onClick={onClick} className={`${onClick ? 'cursor-pointer' : ''} [&:hover>td]:bg-hover ${className}`}>
      {children}
    </tr>
  )
}

type ThProps = { children?: ReactNode; numeric?: boolean } & ThHTMLAttributes<HTMLTableCellElement>
export function Th({ children, numeric = false, className = '', ...props }: ThProps) {
  return (
    <th
      className={`border-b border-line bg-paper px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-3 ${
        numeric ? 'text-right' : 'text-left'
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

type TdVariant = 'default' | 'num' | 'id' | 'name' | 'micro'
const tdVariant: Record<TdVariant, string> = {
  default: 'text-ink',
  num: 'font-mono tabular-nums text-right text-ink',
  id: 'font-mono text-[12px] text-ink-3',
  name: 'font-medium text-ink',
  micro: 'font-mono text-[11px] text-ink-3',
}
type TdProps = { children?: ReactNode; variant?: TdVariant } & TdHTMLAttributes<HTMLTableCellElement>
export function Td({ children, variant = 'default', className = '', ...props }: TdProps) {
  return (
    <td className={`border-b border-line-2 px-3 py-[9px] ${tdVariant[variant]} ${className}`} {...props}>
      {children}
    </td>
  )
}
