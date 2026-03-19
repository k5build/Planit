import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm:   'p-5',
  md:   'p-7',
  lg:   'p-10',
}

export function Card({ className, children, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <h3
      className={cn('text-xs tracking-[0.15em] uppercase text-muted-foreground font-normal', className)}
      style={{ fontFamily: 'Courier New, monospace' }}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}
