'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground resize-none',
            'placeholder:text-muted-foreground/55',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-interactive',
            error && 'border-destructive focus:ring-destructive/20',
            className
          )}
          rows={props.rows ?? 4}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground/70">{hint}</p>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
