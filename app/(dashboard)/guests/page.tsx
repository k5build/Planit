import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { GuestTableClient } from '@/components/guests/GuestTableClient'
import { decrypt } from '@/lib/crypto'

export const metadata: Metadata = { title: 'Guests' }

interface SearchParams {
  eventId?: string
  rsvpStatus?: string
  page?: string
}

const RSVP_STATUS_STYLES: Record<string, string> = {
  CONFIRMED:  'badge-mono badge-confirmed',
  PENDING:    'badge-mono badge-pending',
  DECLINED:   'badge-mono badge-declined',
  WAITLISTED: 'badge-mono badge-draft',
  NO_SHOW:    'badge-mono badge-cancelled',
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const page = parseInt(params.page ?? '1', 10)
  const limit = 50
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (params.eventId) where.eventId = params.eventId
  if (params.rsvpStatus) where.rsvpStatus = params.rsvpStatus

  const [guests, total] = await Promise.all([
    db.guest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        event: { select: { title: true } },
      },
    }),
    db.guest.count({ where }),
  ])

  const decryptedGuests = guests.map((g) => ({
    ...g,
    firstName: g.firstNameEncrypted ? safeDecrypt(g.firstNameEncrypted) : '',
    lastName: g.lastNameEncrypted ? safeDecrypt(g.lastNameEncrypted) : '',
    email: g.emailEncrypted ? safeDecrypt(g.emailEncrypted) : '',
  }))

  const statusCounts = await db.guest.groupBy({
    by: ['rsvpStatus'],
    where: params.eventId ? { eventId: params.eventId } : {},
    _count: { rsvpStatus: true },
  })

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            {total} GUEST{total !== 1 ? 'S' : ''} TOTAL
          </p>
          <h1
            className="text-5xl sm:text-6xl font-light italic text-foreground"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Guests.
          </h1>
        </div>
        <div className="mt-10">
          <span
            className="border border-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-muted-foreground cursor-default"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            ( ADD GUEST )
          </span>
        </div>
      </div>

      <hr className="border-border mb-8" />

      {/* ── RSVP STATUS SUMMARY ────────────────────────────────────────────── */}
      {statusCounts.length > 0 && (
        <div className="flex flex-wrap gap-0 mb-10 border border-border w-fit">
          {statusCounts.map((sc) => (
            <div
              key={sc.rsvpStatus}
              className="flex items-center gap-3 px-5 py-3 border-r border-border last:border-r-0"
            >
              <span className={RSVP_STATUS_STYLES[sc.rsvpStatus] ?? 'badge-mono badge-draft'}>
                {sc.rsvpStatus}
              </span>
              <span
                className="text-xs text-muted-foreground"
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                {sc._count.rsvpStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── GUEST TABLE ────────────────────────────────────────────────────── */}
      <GuestTableClient
        guests={decryptedGuests}
        total={total}
        page={page}
        limit={limit}
        eventId={params.eventId}
      />
    </div>
  )
}

function safeDecrypt(value: string): string {
  try {
    return decrypt(value)
  } catch {
    return '[encrypted]'
  }
}
