import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'badge-mono badge-draft',
  primary: 'badge-mono badge-published',
  success: 'badge-mono badge-confirmed',
  warning: 'badge-mono badge-pending',
  error:   'badge-mono badge-declined',
  outline: 'badge-mono',
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center badge-mono',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    DRAFT:       { variant: 'default',  label: 'DRAFT' },
    PUBLISHED:   { variant: 'primary',  label: 'PUBLISHED' },
    CONFIRMED:   { variant: 'success',  label: 'CONFIRMED' },
    IN_PROGRESS: { variant: 'warning',  label: 'IN PROGRESS' },
    COMPLETED:   { variant: 'success',  label: 'COMPLETED' },
    CANCELLED:   { variant: 'error',    label: 'CANCELLED' },
    POSTPONED:   { variant: 'warning',  label: 'POSTPONED' },
    PENDING:     { variant: 'warning',  label: 'PENDING' },
    DECLINED:    { variant: 'error',    label: 'DECLINED' },
    WAITLISTED:  { variant: 'default',  label: 'WAITLISTED' },
    NO_SHOW:     { variant: 'error',    label: 'NO SHOW' },
    ACTIVE:      { variant: 'success',  label: 'ACTIVE' },
    SOLD_OUT:    { variant: 'error',    label: 'SOLD OUT' },
    EXPIRED:     { variant: 'default',  label: 'EXPIRED' },
  }

  const config = map[status] ?? { variant: 'default' as BadgeVariant, label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
