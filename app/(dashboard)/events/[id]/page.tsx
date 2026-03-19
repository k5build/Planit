import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StatusBadge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  ArrowLeft,
  Edit,
  CheckSquare,
} from 'lucide-react'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/events"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-interactive mt-0.5"
          aria-label="Back to events"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(event.startDate)}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {event.venue.name}
              </span>
            )}
            <span className="capitalize">{event.type.toLowerCase().replace('_', ' ')}</span>
          </p>
        </div>
        {(isAdmin || event.plannerId === session.user.id) && (
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-secondary border border-border hover:bg-secondary/80 text-foreground transition-interactive"
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Guests', value: event._count.guests, sub: `${confirmedGuests} confirmed`, icon: <Users className="h-4 w-4" /> },
          { label: 'Budget', value: formatCurrency(budgetSummary._sum.planned ?? 0, event.currency), sub: `${formatCurrency(budgetSummary._sum.actual ?? 0, event.currency)} spent`, icon: <DollarSign className="h-4 w-4" /> },
          { label: 'Tasks', value: event._count.tasks, sub: `${pendingTasks} pending`, icon: <CheckSquare className="h-4 w-4" /> },
          { label: 'Vendors', value: event.vendors.length, sub: 'Assigned', icon: <Users className="h-4 w-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
            <div className="shrink-0 p-2 bg-primary/8 rounded-xl text-primary" aria-hidden="true">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overview */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            {event.description && (
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
              {[
                { label: 'Start Date', value: formatDateTime(event.startDate) },
                { label: 'End Date', value: formatDateTime(event.endDate) },
                { label: 'Visibility', value: event.visibility },
                { label: 'Timezone', value: event.timezone },
                { label: 'Capacity', value: event.maxCapacity ? String(event.maxCapacity) : 'Unlimited' },
                { label: 'Currency', value: event.currency },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* People */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Planner</p>
              <p className="font-medium text-foreground mt-0.5">{event.planner.email}</p>
            </div>
            {event.client && (
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="font-medium text-foreground mt-0.5">{event.client.email}</p>
              </div>
            )}
            {event.venue && (
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="font-medium text-foreground mt-0.5">{event.venue.name}</p>
                {event.venue.city && (
                  <p className="text-xs text-muted-foreground">{event.venue.city}</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Vendors */}
      {event.vendors.length > 0 && (
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>Assigned Vendors</CardTitle>
          </CardHeader>
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-secondary/30">Vendor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-secondary/30 hidden sm:table-cell">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-secondary/30 hidden md:table-cell">Role</th>
                </tr>
              </thead>
              <tbody>
                {event.vendors.map((ev) => (
                  <tr key={ev.id} className="border-b border-border/50 hover:bg-secondary/20 transition-interactive">
                    <td className="px-5 py-3.5 font-medium text-foreground">{ev.vendor.name}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
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
        </Card>
      )}

      {/* Module Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Guests', count: event._count.guests, href: `/dashboard/guests?eventId=${id}`, icon: <Users className="h-4 w-4" /> },
          { label: 'Budget', count: event._count.budgetItems, href: `/dashboard/budget?eventId=${id}`, icon: <DollarSign className="h-4 w-4" /> },
          { label: 'Documents', count: event._count.documents, href: `/dashboard/events/${id}/documents`, icon: <FileText className="h-4 w-4" /> },
          { label: 'Messages', count: event._count.messages, href: `/dashboard/events/${id}/messages`, icon: <MessageSquare className="h-4 w-4" /> },
        ].map((module) => (
          <Link
            key={module.label}
            href={module.href}
            className="group bg-card border border-border rounded-2xl p-4 text-center hover:border-primary/30 transition-interactive"
          >
            <div className="flex justify-center mb-2 text-muted-foreground group-hover:text-primary transition-interactive" aria-hidden="true">
              {module.icon}
            </div>
            <p className="text-xl font-bold text-foreground">{module.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{module.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
