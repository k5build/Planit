import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-12',
        'border border-border',
        className
      )}
    >
      <p
        className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3"
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        {title}
      </p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
