import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink',
  secondary: 'bg-surface-2 text-text border border-line',
  ghost: 'text-muted',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`min-h-12 rounded-xl px-5 text-base font-semibold transition-opacity active:opacity-80 disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
