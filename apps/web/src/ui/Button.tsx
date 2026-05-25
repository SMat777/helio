import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'default' | 'primary' | 'accent' | 'ghost'

// kilde: .t-btn — variant ejer farven. Primary = warm CTA (act here);
// accent = navy (structural); default/ghost = quiet.
const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-card border border-line text-ink hover:bg-hover',
  primary: 'bg-cta border border-cta text-cta-ink shadow-[0_1px_2px_rgba(120,60,20,0.18)] hover:opacity-90',
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
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 font-sans text-[13.5px] font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
