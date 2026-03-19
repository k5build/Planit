import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const event = await db.event.findUnique({ where: { id }, select: { title: true } })
  return { title: event?.title ?? 'Event' }
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const event = await db.event.findUnique({
    where: { id },
    include: {
      venue: true,
      planner: { select: { id: true, email: true } },
      client: { select: { id: true, email: true } },
      vendors: { include: { vendor: { select: { name: true, category: true } } } },
      _count: {
        select: {
          guests: true,
          tasks: true,
          budgetItems: true,
          documents: true,
          messages: true,
        },
      },
    },
  })

  if (!event) notFound()

  const isAdmin = session.user.role === 'SUPER_ADMIN'
  const canAccess =
    isAdmin ||
    event.plannerId === session.user.id ||
    event.clientId === session.user.id

  if (!canAccess) redirect('/dashboard')

  const budgetSummary = await db.budgetItem.aggregate({
    where: { eventId: id },
    _sum: { planned: true, actual: true },
  })

  const confirmedGuests = await db.guest.count({
    where: { eventId: id, rsvpStatus: 'CONFIRMED' },
  })

  const pendingTasks = await db.task.count({
    where: { eventId: id, status: { in: ['TODO', 'IN_PROGRESS'] } },
  })

  const mono = { fontFamily: 'Courier New, monospace' } as const
  const display = { fontFamily: 'Cormorant Garamond, Georgia, serif' } as const

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/events"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-interactive flex items-center gap-2"
            style={mono}
          >
            ← EVENTS
          </Link>
          {(isAdmin || event.plannerId === session.user.id) && (
            <Link
              href={`/dashboard/events/${id}/edit`}
              className="text-xs tracking-[0.15em] uppercase border border-border px-5 py-2 text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-200"
              style={mono}
            >
              ( EDIT )
            </Link>
          )}
        </div>

        <p
          className="text-xs tracking-[0.2em] uppercase text-primary mb-3"
          style={mono}
        >
          {event.type.replace('_', ' ')}
        </p>

        <div className="flex items-start gap-4 flex-wrap">
          <h1
            className="text-5xl sm:text-6xl font-light italic text-foreground"
            style={display}
          >
            {event.title}
          </h1>
          <div className="mt-3">
            <StatusBadge status={event.status} />
          </div>
        </div>

        <div className="flex items-center gap-5 mt-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={mono}>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(event.startDate)}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" style={mono}>
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {event.venue.name}
              {event.venue.city ? `, ${event.venue.city}` : ''}
            </span>
          )}
        </div>
      </div>

      <hr className="border-border mb-0" />

      {/* ── STATS ROW ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-0">
        {[
          { value: event._count.guests, label: 'GUESTS', sub: `${confirmedGuests} confirmed` },
          { value: formatCurrency(budgetSummary._sum.planned ?? 0, event.currency), label: 'BUDGET', sub: `${formatCurrency(budgetSummary._sum.actual ?? 0, event.currency)} spent` },
          { value: event._count.tasks, label: 'TASKS', sub: `${pendingTasks} pending` },
          { value: event.vendors.length, label: 'VENDORS', sub: 'assigned' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="py-8 px-6"
            style={{ borderRight: i < 3 ? '1px solid var(--border)' : undefined, borderBottom: '1px solid var(--border)' }}
          >
            <p
              className="text-4xl sm:text-5xl font-light text-foreground mb-1"
              style={display}
            >
              {stat.value}
            </p>
            <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground" style={mono}>
              {stat.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1" style={mono}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <hr className="border-border mb-12" />

      {/* ── DETAILS GRID ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border mb-12">
        {/* Overview */}
        <div className="lg:col-span-2 p-7" style={{ borderRight: '1px solid var(--border)' }}>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6" style={mono}>
            OVERVIEW
          </p>
          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {event.description}
            </p>
          )}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'START DATE', value: formatDateTime(event.startDate) },
              { label: 'END DATE', value: formatDateTime(event.endDate) },
              { label: 'VISIBILITY', value: event.visibility },
              { label: 'TIMEZONE', value: event.timezone },
              { label: 'CAPACITY', value: event.maxCapacity ? String(event.maxCapacity) : 'Unlimited' },
              { label: 'CURRENCY', value: event.currency },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-1" style={mono}>
                  {label}
                </p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* People */}
        <div className="p-7">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6" style={mono}>
            PEOPLE
          </p>
          <div className="space-y-5">
            <div>
              <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-1" style={mono}>PLANNER</p>
              <p className="text-sm text-foreground">{event.planner.email}</p>
            </div>
            {event.client && (
              <div>
                <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-1" style={mono}>CLIENT</p>
                <p className="text-sm text-foreground">{event.client.email}</p>
              </div>
            )}
            {event.venue && (
              <div>
                <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-1" style={mono}>VENUE</p>
                <p className="text-sm text-foreground">{event.venue.name}</p>
                {event.venue.city && (
                  <p className="text-xs text-muted-foreground mt-0.5">{event.venue.city}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── VENDORS TABLE ──────────────────────────────────────────────────── */}
      {event.vendors.length > 0 && (
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6" style={mono}>
            ASSIGNED VENDORS
          </p>
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal" style={mono}>Vendor</th>
                <th className="px-5 py-3 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal hidden sm:table-cell" style={mono}>Category</th>
                <th className="px-5 py-3 text-left text-xs tracking-[0.12em] uppercase text-muted-foreground font-normal hidden md:table-cell" style={mono}>Role</th>
              </tr>
            </thead>
            <tbody>
              {event.vendors.map((ev) => (
                <tr key={ev.id} className="border-b border-border/50 hover:bg-muted/20 transition-interactive">
                  <td className="px-5 py-3.5 text-foreground">{ev.vendor.name}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell" style={mono}>
                    {ev.vendor.category.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                    {ev.role ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr className="border-border mb-6" />

      {/* ── MODULE NAVIGATION ──────────────────────────────────────────────── */}
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6" style={mono}>
        NAVIGATE
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border">
        {[
          { label: 'GUESTS',    count: event._count.guests,      href: `/dashboard/guests?eventId=${id}` },
          { label: 'BUDGET',    count: event._count.budgetItems, href: `/dashboard/budget?eventId=${id}` },
          { label: 'DOCUMENTS', count: event._count.documents,   href: `/dashboard/events/${id}/documents` },
          { label: 'MESSAGES',  count: event._count.messages,    href: `/dashboard/events/${id}/messages` },
        ].map((module, i) => (
          <Link
            key={module.label}
            href={module.href}
            className="block py-6 px-5 group hover:bg-muted/20 transition-interactive"
            style={{ borderRight: i < 3 ? '1px solid var(--border)' : undefined }}
          >
            <p
              className="text-3xl font-light text-foreground mb-1 group-hover:text-primary transition-interactive"
              style={display}
            >
              {module.count}
            </p>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-primary transition-interactive" style={mono}>
              {module.label} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
