import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Events' }

interface SearchParams {
  status?: string
  type?: string
  page?: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEDDING: 'WEDDINGS',
  CORPORATE: 'CORPORATE',
  BIRTHDAY: 'BIRTHDAYS',
  CONFERENCE: 'CONFERENCES',
  GALA: 'GALAS',
  EXHIBITION: 'EXHIBITIONS',
  WORKSHOP: 'WORKSHOPS',
  PRIVATE: 'PRIVATE',
  OTHER: 'OTHER',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const isAdmin = session.user.role === 'SUPER_ADMIN'
  const userId = session.user.id
  const page = parseInt(params.page ?? '1', 10)
  const limit = 18
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (!isAdmin) where.OR = [{ plannerId: userId }, { clientId: userId }]
  if (params.status) where.status = params.status
  if (params.type) where.type = params.type

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        venue: { select: { name: true, city: true } },
        _count: { select: { guests: true } },
      },
    }),
    db.event.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  const filterTypes = ['ALL', 'WEDDING', 'GALA', 'CORPORATE', 'BIRTHDAY', 'CONFERENCE', 'PRIVATE']

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            {total} EVENT{total !== 1 ? 'S' : ''} TOTAL
          </p>
          <h1
            className="text-5xl sm:text-6xl font-light italic text-foreground"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Events.
          </h1>
        </div>
        <Link
          href="/dashboard/events/new"
          className="border border-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-foreground hover:text-background transition-all duration-200 mt-10"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          ( CREATE EVENT )
        </Link>
      </div>

      <hr className="border-border mb-8" />

      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-0 mb-10 border border-border">
        {filterTypes.map((type) => {
          const isActive = type === 'ALL' ? !params.type : params.type === type
          const href = type === 'ALL'
            ? '/dashboard/events'
            : `/dashboard/events?type=${type}`
          return (
            <Link
              key={type}
              href={href}
              className="px-5 py-2.5 text-xs tracking-[0.12em] uppercase border-r border-border last:border-r-0 transition-interactive"
              style={{
                fontFamily: 'Courier New, monospace',
                backgroundColor: isActive ? 'var(--foreground)' : 'transparent',
                color: isActive ? 'var(--background)' : 'var(--muted-foreground)',
              }}
            >
              {EVENT_TYPE_LABELS[type] ?? type}
            </Link>
          )
        })}
      </div>

      {/* ── EVENTS GRID ────────────────────────────────────────────────────── */}
      {events.length === 0 ? (
        <div className="border border-border py-20 text-center">
          <p
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            NO EVENTS FOUND
          </p>
          <Link
            href="/dashboard/events/new"
            className="inline-block text-xs tracking-[0.15em] uppercase border border-border px-6 py-2 hover:border-foreground hover:text-foreground text-muted-foreground transition-all duration-200"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            ( CREATE FIRST EVENT )
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {events.map((event, i) => {
            const figNum = String(i + 1 + skip).padStart(2, '0')
            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="bg-background p-6 sm:p-8 block group hover:bg-muted/20 transition-interactive"
              >
                <p
                  className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  FIG. {figNum}
                </p>
                {/* Image placeholder */}
                <div
                  className="aspect-video w-full mb-5"
                  style={{ background: 'linear-gradient(135deg, #E8E4DF 0%, #D0C9C2 100%)' }}
                />
                {/* Type */}
                <p
                  className="text-xs tracking-[0.15em] uppercase text-primary mb-2"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  {event.type.replace('_', ' ')}
                </p>
                {/* Title */}
                <h3
                  className="text-xl sm:text-2xl font-light italic text-foreground mb-3 group-hover:text-primary transition-interactive"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {event.title}
                </h3>
                {/* Meta */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDate(event.startDate)}</p>
                    {event.venue && (
                      <p
                        className="text-xs text-muted-foreground mt-0.5 tracking-[0.08em] uppercase"
                        style={{ fontFamily: 'Courier New, monospace' }}
                      >
                        {event.venue.city ?? event.venue.name}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── PAGINATION ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center gap-0 mt-8 border border-border w-fit">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/events?page=${p}${params.type ? `&type=${params.type}` : ''}`}
              className="w-10 h-10 flex items-center justify-center text-xs border-r border-border last:border-r-0 transition-interactive"
              style={{
                fontFamily: 'Courier New, monospace',
                backgroundColor: p === page ? 'var(--foreground)' : 'transparent',
                color: p === page ? 'var(--background)' : 'var(--muted-foreground)',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
