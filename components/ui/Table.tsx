import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
  mobileHidden?: boolean
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  className?: string
  emptyMessage?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className,
  emptyMessage = 'No data found.',
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-t border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left py-3 px-4 text-xs tracking-[0.12em] uppercase font-normal text-muted-foreground',
                  col.mobileHidden && 'hidden sm:table-cell',
                  col.className
                )}
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-border/60 hover:bg-muted/20 transition-interactive"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5 text-foreground',
                      col.mobileHidden && 'hidden sm:table-cell',
                      col.className
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Editorial stat card for dashboard
export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('py-6 border-r border-border last:border-r-0', className)}>
      <p
        className="text-5xl font-light text-foreground mb-2"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        {value}
      </p>
      <p
        className="text-xs tracking-[0.18em] uppercase text-muted-foreground"
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        {label}
      </p>
      {sub && (
        <p
          className="text-xs text-muted-foreground/60 mt-1"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
