'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'destructive' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const monoStyle = { fontFamily: 'Courier New, Courier, monospace' } as const

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
  ghost:
    'bg-transparent text-foreground hover:text-primary',
  outline:
    'border border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground',
  secondary:
    'border border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground',
  destructive:
    'border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8  px-5  text-[0.65rem]',
  md: 'h-10 px-7  text-[0.7rem]',
  lg: 'h-12 px-9  text-[0.7rem]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'tracking-[0.15em] uppercase transition-all duration-200',
          'disabled:opacity-40 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        style={{ ...monoStyle, ...style }}
        {...props}
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
