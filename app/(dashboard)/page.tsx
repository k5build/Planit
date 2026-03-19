import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id
  const isAdmin = session.user.role === 'SUPER_ADMIN'

  const [totalEvents, upcomingEvents, totalGuests, recentEvents] = await Promise.all([
    db.event.count({
      where: isAdmin ? {} : { OR: [{ plannerId: userId }, { clientId: userId }] },
    }),
    db.event.count({
      where: {
        startDate: { gte: new Date() },
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
        ...(isAdmin ? {} : { OR: [{ plannerId: userId }, { clientId: userId }] }),
      },
    }),
    db.guest.count({
      where: isAdmin
        ? {}
        : { event: { OR: [{ plannerId: userId }, { clientId: userId }] } },
    }),
    db.event.findMany({
      where: isAdmin ? {} : { OR: [{ plannerId: userId }, { clientId: userId }] },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        startDate: true,
        _count: { select: { guests: true } },
      },
    }),
  ])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase()

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="mb-12">
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          {today}
        </p>
        <h1
          className="text-5xl sm:text-6xl font-light italic text-foreground"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Dashboard.
        </h1>
      </div>

      <hr className="border-border mb-12" />

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-12">
        {[
          { value: totalEvents, label: 'EVENTS' },
          { value: upcomingEvents, label: 'UPCOMING' },
          { value: totalGuests, label: 'GUESTS' },
          { value: `${upcomingEvents}`, label: 'CONFIRMED' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="py-8 px-6"
            style={{ borderRight: i < 3 ? '1px solid var(--border)' : undefined }}
          >
            <p
              className="text-5xl sm:text-6xl font-light text-foreground mb-2"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs tracking-[0.18em] uppercase text-muted-foreground"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <hr className="border-border mb-12" />

      {/* ── QUICK ACTIONS ──────────────────────────────────────────────────── */}
      <div className="mb-14">
        <p
          className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          QUICK ACTIONS
        </p>
        <div className="space-y-0">
          {[
            { label: 'Create New Event', href: '/dashboard/events/new', desc: 'Start planning a new event' },
            { label: 'Manage Guests', href: '/dashboard/guests', desc: 'View and update guest lists' },
            { label: 'Add Vendor', href: '/dashboard/vendors', desc: 'Add a vendor to your directory' },
            { label: 'Review Budget', href: '/dashboard/budget', desc: 'Track planned vs actual spend' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between py-5 border-b border-border group hover:pl-2 transition-all duration-200"
            >
              <div className="flex items-center gap-6">
                <span
                  className="text-xs text-muted-foreground group-hover:text-primary transition-interactive"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  →
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-interactive">
                    {action.label}
                  </p>
                  <p
                    className="text-xs text-muted-foreground mt-0.5"
                    style={{ fontFamily: 'Courier New, monospace' }}
                  >
                    {action.desc}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground text-xs group-hover:text-primary transition-interactive">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RECENT EVENTS ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            RECENT EVENTS
          </p>
          <Link
            href="/dashboard/events"
            className="text-xs text-muted-foreground hover:text-foreground transition-interactive"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            VIEW ALL →
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="border border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">No events yet.</p>
            <Link
              href="/dashboard/events/new"
              className="inline-block mt-4 text-xs tracking-[0.15em] uppercase border border-border px-6 py-2 hover:border-foreground hover:text-foreground text-muted-foreground transition-all duration-200"
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              ( CREATE YOUR FIRST EVENT )
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-t border-border">
                <th
                  className="py-3 px-0 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  EVENT
                </th>
                <th
                  className="py-3 px-4 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal hidden sm:table-cell"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  TYPE
                </th>
                <th
                  className="py-3 px-4 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal hidden md:table-cell"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  DATE
                </th>
                <th
                  className="py-3 px-4 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal hidden sm:table-cell"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  GUESTS
                </th>
                <th
                  className="py-3 px-0 text-right text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-border/60 hover:bg-muted/20 transition-interactive">
                  <td className="py-4 px-0">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-sm text-foreground hover:text-primary transition-interactive"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem' }}
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td
                    className="py-4 px-4 text-muted-foreground hidden sm:table-cell text-xs tracking-[0.1em] uppercase"
                    style={{ fontFamily: 'Courier New, monospace' }}
                  >
                    {event.type.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground hidden md:table-cell text-xs">
                    {formatDate(event.startDate)}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground hidden sm:table-cell text-xs">
                    {event._count.guests}
                  </td>
                  <td className="py-4 px-0 text-right">
                    <StatusBadge status={event.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
