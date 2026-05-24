import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'default' | 'primary' | 'accent' | 'ghost'

// kilde: .t-btn — variant ejer farven.
const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-card border border-line text-ink hover:bg-hover',
  primary: 'bg-ink border border-ink text-white hover:opacity-90',
  accent: 'bg-accent border border-accent text-white hover:opacity-90',
  ghost: 'bg-transparent border border-transparent text-ink-2 hover:bg-hover hover:text-ink',
}

type ButtonProps = {
  variant?: ButtonVariant
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = 'default', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 font-sans text-[12.5px] font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
