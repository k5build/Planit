'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownItem {
  label: string
  onClick?: () => void
  href?: string
  icon?: React.ReactNode
  destructive?: boolean
  disabled?: boolean
  separator?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      {open && (
        <div
          className={cn(
            'absolute top-full mt-1.5 z-40 w-48 bg-popover border border-border rounded-xl shadow-lg py-1 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, i) => {
            if (item.separator) {
              return <div key={i} className="my-1 border-t border-border" role="separator" />
            }
            return (
              <button
                key={i}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setOpen(false)
                  }
                }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-left transition-interactive',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  item.destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground hover:bg-secondary'
                )}
              >
                {item.icon && (
                  <span className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground pr-9',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-interactive',
            error && 'border-destructive',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
