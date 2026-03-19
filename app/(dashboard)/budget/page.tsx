import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { BudgetClient } from '@/components/budget/BudgetClient'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Budget' }

interface SearchParams {
  eventId?: string
}

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const userId = session.user.id
  const isAdmin = session.user.role === 'SUPER_ADMIN'

  const events = await db.event.findMany({
    where: isAdmin ? {} : { OR: [{ plannerId: userId }, { clientId: userId }] },
    select: { id: true, title: true },
    orderBy: { startDate: 'desc' },
    take: 20,
  })

  const eventId = params.eventId ?? events[0]?.id

  let budgetItems: Awaited<ReturnType<typeof db.budgetItem.findMany>> = []
  let summary = { planned: 0, actual: 0 }
  let eventTitle = ''

  if (eventId) {
    budgetItems = await db.budgetItem.findMany({
      where: { eventId },
      orderBy: { category: 'asc' },
    })
    const agg = await db.budgetItem.aggregate({
      where: { eventId },
      _sum: { planned: true, actual: true },
    })
    summary = {
      planned: agg._sum.planned ?? 0,
      actual: agg._sum.actual ?? 0,
    }
    const event = events.find((e) => e.id === eventId)
    eventTitle = event?.title ?? ''
  }

  const byCategory = budgetItems.reduce<Record<string, typeof budgetItems>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const spendPct = summary.planned > 0
    ? Math.min(100, Math.round((summary.actual / summary.planned) * 100))
    : 0

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          {eventTitle ? `EVENT — ${eventTitle.toUpperCase()}` : 'SELECT AN EVENT'}
        </p>
        <h1
          className="text-5xl sm:text-6xl font-light italic text-foreground"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Budget.
        </h1>
      </div>

      <hr className="border-border mb-10" />

      {/* ── BUDGET OVERVIEW ────────────────────────────────────────────────── */}
      {summary.planned > 0 && (
        <div className="mb-12">
          {/* Big number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 mb-8">
            <div className="py-8 sm:border-r border-border">
              <p
                className="text-5xl sm:text-6xl font-light text-foreground mb-2"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {formatCurrency(summary.planned)}
              </p>
              <p
                className="text-xs tracking-[0.18em] uppercase text-muted-foreground"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                PLANNED
              </p>
            </div>
            <div className="py-8 sm:border-r border-border sm:px-10 border-t sm:border-t-0">
              <p
                className="text-5xl sm:text-6xl font-light text-foreground mb-2"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {formatCurrency(summary.actual)}
              </p>
              <p
                className="text-xs tracking-[0.18em] uppercase text-muted-foreground"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                ACTUAL
              </p>
            </div>
            <div className="py-8 sm:px-10 border-t sm:border-t-0">
              <p
                className="text-5xl sm:text-6xl font-light text-foreground mb-2"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  color: summary.actual > summary.planned ? 'var(--destructive)' : 'var(--success)',
                }}
              >
                {formatCurrency(Math.abs(summary.planned - summary.actual))}
              </p>
              <p
                className="text-xs tracking-[0.18em] uppercase text-muted-foreground"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                {summary.actual > summary.planned ? 'OVER BUDGET' : 'REMAINING'}
              </p>
            </div>
          </div>

          {/* Thin progress line */}
          <div className="mb-2">
            <div className="h-px w-full bg-border relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-700"
                style={{ width: `${spendPct}%`, height: '2px', top: '-0.5px' }}
              />
            </div>
          </div>
          <p
            className="text-xs text-muted-foreground"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            {spendPct}% OF BUDGET SPENT
          </p>
        </div>
      )}

      <BudgetClient
        events={events}
        selectedEventId={eventId}
        budgetItems={budgetItems}
        byCategory={byCategory}
        summary={summary}
      />
    </div>
  )
}
